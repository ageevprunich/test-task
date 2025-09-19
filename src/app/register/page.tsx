"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { auth } from "@/firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuthStore } from "@/store/authStore";

const RegisterPage = () => {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setError(null);

        // Простенька валідація
        if (!email.includes("@")) {
            setError("Введіть коректний email");
            return;
        }
        if (password.length < 6) {
            setError("Пароль має містити мінімум 6 символів");
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            setUser({ uid: userCredential.user.uid, email: userCredential.user.email! });
            router.push("/trips"); // редірект після реєстрації
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg border border-gray-200 flex flex-col items-center">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
                    Створити акаунт
                </h2>

                {error && <p className="mb-4 text-center text-red-600">{error}</p>}

                <div className="w-full mb-4">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Введіть email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                </div>

                <div className="w-full mb-6">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Введіть пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                </div>

                <Button
                    onClick={handleRegister}
                    className="w-full bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md py-2 mb-4"
                    disabled={loading}
                >
                    {loading ? "Реєстрація..." : "Зареєструватися"}
                </Button>

                <p className="text-center text-sm text-gray-600">
                    Вже маєте акаунт?{" "}
                    <Link href="/sign-in" className="font-medium text-blue-600 hover:underline">
                        Увійти
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
