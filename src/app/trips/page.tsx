"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTrips } from "@/hooks/useTrips";

const TripsPage = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const { trips, loading, error, createTrip } = useTrips(user?.uid);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleCreateTrip = async () => {
        await createTrip(title, description, startDate, endDate);
        setTitle("");
        setDescription("");
        setStartDate("");
        setEndDate("");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Мої подорожі</h1>

                {error && <p className="mb-4 text-red-600">{error}</p>}

                {/* Форма створення подорожі */}
                <div className="bg-white p-4 rounded-md shadow mb-6">
                    <div className="mb-2">
                        <Label htmlFor="title">Назва подорожі</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Введіть назву"
                            className="mt-1"
                        />
                    </div>

                    <div className="mb-2">
                        <Label htmlFor="description">Опис (необов'язково)</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Короткий опис"
                            className="mt-1"
                        />
                    </div>

                    <div className="mb-2">
                        <Label htmlFor="startDate">Дата початку</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div className="mb-2">
                        <Label htmlFor="endDate">Дата завершення</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <Button onClick={handleCreateTrip} disabled={loading} className="border mt-2">
                        {loading ? "Створення..." : "Створити подорож"}
                    </Button>
                </div>

                {/* Список подорожей */}
                {trips.length === 0 ? (
                    <p>У вас ще немає подорожей</p>
                ) : (
                    <ul className="space-y-4">
                        {trips.map((trip) => (
                            <li
                                key={trip.id}
                                className="p-4 bg-white rounded-md shadow flex justify-between items-center cursor-pointer hover:bg-gray-50"
                                onClick={() => router.push(`/trips/${trip.id}`)}
                            >
                                <div>
                                    <h2 className="font-semibold">{trip.title}</h2>
                                    {trip.description && <p className="text-gray-600 text-sm">{trip.description}</p>}
                                    {trip.startDate && trip.endDate && (
                                        <p className="text-gray-500 text-sm">{trip.startDate} – {trip.endDate}</p>
                                    )}
                                </div>
                                <span className="text-gray-400 hover:bg-blue-600 hover:text-white border rounded ">&rarr;</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TripsPage;
