"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type Trip = {
    id: string;
    title: string;
    description?: string;
};

const TripsPage = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const [trips, setTrips] = useState<Trip[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchTrips = async () => {
            try {
                const q = query(
                    collection(db, "trips"),
                    where("ownerId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );

                const snapshot = await getDocs(q);
                const tripsData: Trip[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Trip, "id">),
                }));
                setTrips(tripsData);
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchTrips();
    }, [user]);

    const handleCreateTrip = async () => {
        if (!title.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const docRef = await addDoc(collection(db, "trips"), {
                title,
                description: description || "",
                ownerId: user!.uid,
                collaborators: [],
                createdAt: Timestamp.now(),
            });

            setTrips([{ id: docRef.id, title, description }, ...trips]);
            setTitle("");
            setDescription("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <p className="p-4 text-center">Будь ласка, увійдіть в акаунт</p>;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
            <div className="w-full max-w-3xl">
                <h1 className="text-3xl font-bold mb-6 text-center">Мої подорожі</h1>

                {error && <p className="mb-4 text-center text-red-600">{error}</p>}

                {/* Форма створення подорожі */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-center">Створити нову подорож</h2>

                    <div className="mb-4">
                        <Label htmlFor="title">Назва подорожі</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Введіть назву"
                            className="mt-1"
                        />
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="description">Опис (необов'язково)</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Короткий опис"
                            className="mt-1"
                        />
                    </div>

                    <Button
                        onClick={handleCreateTrip}
                        disabled={loading}
                        className="w-full mt-2"
                    >
                        {loading ? "Створення..." : "Створити подорож"}
                    </Button>
                </div>

                {/* Список подорожей */}
                {trips.length === 0 ? (
                    <p className="text-center text-gray-600">У вас ще немає подорожей</p>
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
                                </div>
                                <span className="text-gray-400">&rarr;</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TripsPage;
