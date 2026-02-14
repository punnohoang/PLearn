"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register, error } = useAuth();

    const handleRegister = async () => {
        // Validation
        if (!name.trim()) {
            alert("Vui lòng nhập họ và tên");
            return;
        }
        if (!email.trim()) {
            alert("Vui lòng nhập email");
            return;
        }
        if (password.length < 6) {
            alert("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        setIsLoading(true);
        try {
            await register(email, password, name);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-96">
                <h1 className="text-2xl font-bold mb-2">Đăng ký PLearn</h1>
                <p className="text-gray-600 text-sm mb-6">Tạo tài khoản để bắt đầu học</p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        <div className="font-bold mb-1">❌ Lỗi:</div>
                        <div className="text-sm">{error}</div>
                        <div className="text-xs mt-2 text-gray-600">API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}</div>
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Họ và tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    disabled={isLoading}
                />
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
                    placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    disabled={isLoading}
                />
                <button
                    onClick={handleRegister}
                    disabled={isLoading || !email || !password || !name}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
                >
                    {isLoading ? "⏳ Đang đăng ký..." : "Đăng ký"}
                </button>

                <hr className="my-6" />

                <p className="text-center text-gray-600">
                    Đã có tài khoản?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
