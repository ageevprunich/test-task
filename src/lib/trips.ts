import { db } from "@/firebase/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export type Trip = {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  ownerId: string;
  collaborators: string[];
};

// Отримати подорож
export const getTrip = async (tripId: string): Promise<Trip | null> => {
  if (!tripId) return null;
  const docRef = doc(db, "trips", tripId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Trip) : null;
};

// Оновити подорож
export const updateTrip = async (tripId: string, updated: Partial<Trip>) => {
  if (!tripId) throw new Error("Невірний ID подорожі");
  const docRef = doc(db, "trips", tripId);
  await updateDoc(docRef, updated);
};

// Видалити подорож
export const deleteTrip = async (tripId: string) => {
  if (!tripId) throw new Error("Невірний ID подорожі");
  const docRef = doc(db, "trips", tripId);
  await deleteDoc(docRef);
};
