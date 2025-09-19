import { useEffect, useState } from "react";
import { Trip, getTrip, updateTrip, deleteTrip } from "@/lib/trips";
import { Place, getPlaces, addPlace, updatePlace, deletePlace } from "@/lib/places";

export const useTripDetail = (tripId: string | undefined, userId: string | undefined) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner = trip?.ownerId === userId;
  const isCollaborator = trip?.collaborators?.includes(userId || "");
  const canEdit = isOwner || isCollaborator;

  useEffect(() => {
    if (!tripId) return;
    const fetchData = async () => {
      setLoading(true);
      const tripData = await getTrip(tripId);
      setTrip(tripData);
      const placesData = await getPlaces(tripId);
      setPlaces(placesData);
      setLoading(false);
    };
    fetchData();
  }, [tripId]);

  const handleUpdateTrip = async (updated: Partial<Trip>) => {
    if (!tripId || !canEdit) return;
    await updateTrip(tripId, updated);
    setTrip({ ...trip!, ...updated });
  };

  const handleDeleteTrip = async () => {
    if (!tripId || !isOwner) return;
    await deleteTrip(tripId);
  };

  const handleAddPlace = async (place: Omit<Place, "id">) => {
    if (!tripId || !canEdit) return;
    const newPlace = await addPlace(tripId, place);
    setPlaces([...places, newPlace]);
  };

  const handleUpdatePlace = async (placeId: string, updated: Partial<Place>) => {
    if (!tripId || !canEdit) return;
    await updatePlace(tripId, placeId, updated);
    setPlaces(places.map(p => p.id === placeId ? { ...p, ...updated } : p));
  };

  const handleDeletePlace = async (placeId: string) => {
    if (!tripId || !canEdit) return;
    await deletePlace(tripId, placeId);
    setPlaces(places.filter(p => p.id !== placeId));
  };

  return {
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
  };
};
