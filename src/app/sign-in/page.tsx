"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { auth } from "@/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuthStore } from "@/store/authStore";

const SignInPage = () => {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser({ uid: userCredential.user.uid, email: userCredential.user.email! });
            router.push("/trips");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            {/* Центрований контейнер форми */}
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg border border-gray-200 flex flex-col items-center">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
                    Увійти в акаунт
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
                    onClick={handleSignIn}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md py-2 mb-4"
                    disabled={loading}
                >
                    {loading ? "Завантаження..." : "Увійти"}
                </Button>

                <p className="text-center text-sm text-gray-600">
                    Не маєте акаунту?{" "}
                    <a href="/register" className="font-medium text-blue-600 hover:underline">
                        Зареєструватися
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SignInPage;
