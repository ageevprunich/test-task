import { create } from "zustand";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

interface AuthState {
  user: { uid: string; email: string } | null;
  setUser: (user: { uid: string; email: string } | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  onAuthStateChanged(auth, (firebaseUser: User | null) => {
    if (firebaseUser) {
      set({ user: { uid: firebaseUser.uid, email: firebaseUser.email! } });
    } else {
      set({ user: null });
    }
  });

  return {
    user: null,
    setUser: (user) => set({ user }),
  };
});
