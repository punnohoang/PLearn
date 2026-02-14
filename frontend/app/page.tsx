"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function Home() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      window.location.href = "/courses";
    }
  }, [user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Chào mừng đến PLearn
        </h1>
        <p className="text-xl text-gray-700 mb-12">
          Nền tảng học tập trực tuyến. Hãy đăng nhập hoặc đăng ký để bắt đầu học tập.
        </p>

        <div className="flex gap-6 justify-center">
          <a
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            Đăng nhập
          </a>
          <a
            href="/register"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition"
          >
            Đăng ký
          </a>
        </div>
      </div>
    </div>
  );
}
