import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export type Trip = {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

export const useTrips = (userId?: string) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchTrips = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, "trips"),
          where("ownerId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const tripsData: Trip[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Trip, "id">),
        }));
        setTrips(tripsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [userId]);

  const createTrip = async (title: string, description?: string, startDate?: string, endDate?: string) => {
    if (!title.trim() || !userId) return;

    // Перевірка дат
    if (startDate && endDate && startDate > endDate) {
      setError("Дата початку не може бути пізніше дати завершення");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(collection(db, "trips"), {
        title,
        description: description || "",
        startDate: startDate || null,
        endDate: endDate || null,
        ownerId: userId,
        collaborators: [],
        createdAt: Timestamp.now(),
      });
      setTrips(prev => [{ id: docRef.id, title, description, startDate, endDate }, ...prev]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    trips,
    loading,
    error,
    createTrip,
  };
};
