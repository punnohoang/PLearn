"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, error } = useAuth();

    const handleLogin = async () => {
        if (!email.trim()) {
            alert("Vui lòng nhập email");
            return;
        }
        if (!password) {
            alert("Vui lòng nhập mật khẩu");
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
        } finally {
            setIsLoading(false);
        }
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-96">
                <h1 className="text-2xl font-bold mb-2">Đăng nhập PLearn</h1>
                <p className="text-gray-600 text-sm mb-6">Đăng nhập để tiếp tục học tập</p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        <div className="font-bold mb-1">❌ Lỗi:</div>
                        <div className="text-sm">{error}</div>
                        <div className="text-xs mt-2 text-gray-600">API: {apiUrl}</div>
                    </div>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    disabled={isLoading}
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    disabled={isLoading}
                />
                <button
                    onClick={handleLogin}
                    disabled={isLoading || !email || !password}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
                >
                    {isLoading ? "⏳ Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <hr className="my-6" />

                <p className="text-center text-gray-600">
                    Chưa có tài khoản?{" "}
                    <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
