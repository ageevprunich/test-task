"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/firebase/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import "./globals.css"; 


interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Відстежуємо стан авторизації при старті
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/sign-in");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <html lang="uk">
      <body className="min-h-screen bg-gray-100">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Travel Planner</h1>
          <div className="space-x-2">
            {!loading && !user && (
              <>
                <Button variant="outline" onClick={() => router.push("/sign-in")}>
                  Увійти
                </Button>
                <Button variant="default" onClick={() => router.push("/register")}>
                  Зареєструватися
                </Button>
              </>
            )}

            {!loading && user && (
              <>
                <span className="text-gray-700 mr-2">{user.email}</span>
                <Button variant="destructive" onClick={handleLogout} className="ml-2 text-black border border-black hover:bg-red-600 hover:text-white">
                  Вийти
                </Button>
              </>
            )}
          </div>
        </header>

        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}