"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTripDetail } from "@/hooks/useTripDetail";
import { Place } from "@/lib/places";

const TripDetailPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const user = useAuthStore((state) => state.user);

    if (!id || Array.isArray(id)) return <p>Невірний ID подорожі</p>;

    const {
        trip,
        places,
        loading,
        canEdit,
        isOwner,
        handleUpdateTrip,
        handleDeleteTrip,
        handleAddPlace,
        handleUpdatePlace,
        handleDeletePlace
    } = useTripDetail(id, user?.uid);

    // --- Стан для редагування подорожі ---
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // --- Стан для додавання місця ---
    const [newLocation, setNewLocation] = useState("");
    const [newNotes, setNewNotes] = useState("");
    const [newDayNumber, setNewDayNumber] = useState<number>(1);

    // --- Стан для інвайту ---
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

    // --- Синхронізуємо локальний стан при завантаженні подорожі ---
    if (trip && !title) {
        setTitle(trip.title);
        setDescription(trip.description || "");
        setStartDate(trip.startDate || "");
        setEndDate(trip.endDate || "");
    }

    const onUpdateTrip = async () => {
        if (startDate && endDate && startDate > endDate) {
            alert("Дата початку не може бути пізніше дати завершення");
            return;
        }
        await handleUpdateTrip({ title, description, startDate, endDate });
        setEditing(false);
    };

    const onDeleteTrip = async () => {
        if (!confirm("Ви впевнені, що хочете видалити цю подорож?")) return;
        await handleDeleteTrip();
        router.push("/trips");
    };

    const onAddPlace = async () => {
        if (!newLocation.trim()) return;
        await handleAddPlace({ locationName: newLocation, notes: newNotes, dayNumber: newDayNumber });
        setNewLocation("");
        setNewNotes("");
        setNewDayNumber(1);
    };

    // --- Відправка інвайту ---
    const handleSendInvite = async () => {
        if (!inviteEmail.trim()) return;
        if (inviteEmail === user?.email) {
            setInviteError("Ви не можете запросити себе");
            return;
        }

        setInviteLoading(true);
        setInviteError(null);
        setInviteSuccess(null);

        try {
            const res = await fetch("/api/invites/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tripId: id, email: inviteEmail, currentUserUid: user?.uid })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Помилка при відправці інвайту");

            setInviteSuccess("Інвайт надіслано успішно!");
            setInviteEmail("");
        } catch (err: any) {
            setInviteError(err.message);
        } finally {
            setInviteLoading(false);
        }
    };

    if (loading) return <p className="p-4">Завантаження...</p>;
    if (!trip) return <p className="p-4">Подорож не знайдена</p>;

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-4">
            {/* --- Подорож --- */}
            <div className="bg-white p-4 rounded-md shadow">
                {editing ? (
                    <div className="space-y-2">
                        <Label>Назва</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                        <Label>Опис</Label>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                        <Label>Дата початку</Label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <Label>Дата завершення</Label>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        <div className="flex gap-2 mt-2">
                            <Button onClick={onUpdateTrip} className="bg-blue-600 hover:bg-blue-700">Зберегти</Button>
                            <Button onClick={() => setEditing(false)} className="bg-gray-400 hover:bg-gray-500">Скасувати</Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">{trip.title}</h2>
                        {trip.description && <p>{trip.description}</p>}
                        {trip.startDate && trip.endDate && <p>{trip.startDate} – {trip.endDate}</p>}
                        {isOwner && (
                            <div className="flex gap-2 mt-2">
                                <Button onClick={() => setEditing(true)} className="bg-blue-600 hover:bg-blue-700">Редагувати</Button>
                                <Button onClick={onDeleteTrip} className="bg-red-600 hover:bg-red-700">Видалити</Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- Додавання місця --- */}
            {canEdit && (
                <div className="bg-white p-4 rounded-md shadow space-y-2">
                    <h3 className="font-semibold">Додати місце</h3>
                    <Label>Назва локації</Label>
                    <Input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                    <Label>Нотатки</Label>
                    <Input value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
                    <Label>День</Label>
                    <Input type="number" min={1} value={newDayNumber} onChange={(e) => setNewDayNumber(parseInt(e.target.value) || 1)} />
                    <Button onClick={onAddPlace} className="mt-1">Додати місце</Button>
                </div>
            )}

            {/* --- Список місць --- */}
            <div className="space-y-2">
                <h3 className="text-xl font-semibold">Місця</h3>
                {places.length === 0 ? (
                    <p>Місць поки немає</p>
                ) : (
                    <ul className="space-y-2">
                        {places.map((p, index) => (
                            <li key={p.id || index} className="bg-white p-3 rounded-md shadow flex justify-between items-center">
                                <div>
                                    <p className="font-medium">День {p.dayNumber}: {p.locationName}</p>
                                    {p.notes && <p className="text-gray-600 text-sm">{p.notes}</p>}
                                </div>
                                {canEdit && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="border border-black text-black bg-blue-600 hover:bg-blue-700 transition-colors"
                                            onClick={() => {
                                                const newNotes = prompt("Редагувати нотатки", p.notes || "") || "";
                                                handleUpdatePlace(p.id!, { notes: newNotes });
                                            }}
                                        >
                                            Редагувати
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="border border-black text-black bg-red-600 hover:bg-red-700 transition-colors"
                                            onClick={() => handleDeletePlace(p.id!)}
                                        >
                                            Видалити
                                        </Button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* --- Форма інвайту --- */}
            {canEdit && (
                <div className="bg-white p-4 rounded-md shadow space-y-2">
                    <h3 className="font-semibold">Запросити співпрацівника</h3>

                    <Label>Email</Label>
                    <Input
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Введіть email"
                    />

                    {inviteError && <p className="text-red-600">{inviteError}</p>}
                    {inviteSuccess && <p className="text-green-600">{inviteSuccess}</p>}

                    <Button
                        onClick={handleSendInvite}
                        disabled={inviteLoading}
                        className="mt-2"
                    >
                        {inviteLoading ? "Надсилаю..." : "Надіслати інвайт"}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TripDetailPage;
