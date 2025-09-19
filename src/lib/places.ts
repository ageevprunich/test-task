import { db } from "@/firebase/firebase";
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";

export type Place = {
  id?: string;
  locationName: string;
  notes?: string;
  dayNumber: number;
};

// Отримати місця по подорожі
export const getPlaces = async (tripId: string): Promise<Place[]> => {
  if (!tripId) return [];
  const placesRef = collection(db, "trips", tripId, "places");
  const q = query(placesRef, orderBy("dayNumber", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Place, "id">) }));
};

// Додати місце
export const addPlace = async (tripId: string, place: Omit<Place, "id">) => {
  if (!tripId) throw new Error("Невірний ID подорожі");
  const placesRef = collection(db, "trips", tripId, "places");
  const docRef = await addDoc(placesRef, place);
  return { id: docRef.id, ...place };
};

// Оновити місце
export const updatePlace = async (tripId: string, placeId: string, updated: Partial<Place>) => {
  if (!tripId || !placeId) throw new Error("Невірний ID подорожі або місця");
  const placeRef = doc(db, "trips", tripId, "places", placeId);
  await updateDoc(placeRef, updated);
};

// Видалити місце
export const deletePlace = async (tripId: string, placeId: string) => {
  if (!tripId || !placeId) throw new Error("Невірний ID подорожі або місця");
  const placeRef = doc(db, "trips", tripId, "places", placeId);
  await deleteDoc(placeRef);
};
