"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuth();

    useEffect(() => {
        loadEnrollments();
    }, []);

    const loadEnrollments = async () => {
        try {
            const res = await api.get("/enrollments");
            setEnrollments(res.data || []);
        } catch (err) {
            setError("Không thể tải khóa học");
        } finally {
            setLoading(false);
        }
    };

    const askAI = async () => {
        if (!question.trim()) {
            setError("Vui lòng nhập câu hỏi");
            return;
        }

        setAiLoading(true);
        setError("");
        try {
            const res = await api.post("/ai/ask", {
                question,
                context: `Bạn đang học khóa ${enrollments[0]?.course.title || "PLearn"}`,
            });
            setAnswer(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Lỗi khi hỏi AI");
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-600">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                    <p className="text-blue-100">Xem tiến độ và hỏi AI trợ lý</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Enrollments Section */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6">📚 Khóa học của bạn</h2>

                        {enrollments.length === 0 ? (
                            <div className="bg-white p-8 rounded-lg shadow text-center">
                                <p className="text-gray-600 mb-4">Bạn chưa đăng ký khóa học nào</p>
                                <Link href="/courses">
                                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                                        Xem khóa học
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {enrollments.map((enrollment) => (
                                    <Link key={enrollment.id} href={`/courses/${enrollment.course.id}`}>
                                        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-lg">{enrollment.course.title}</h3>
                                                <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded">
                                                    {enrollment.progress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-green-500 h-full transition-all"
                                                    style={{ width: `${enrollment.progress}%` }}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2">
                                                Giảng viên: {enrollment.course.instructor.name}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* AI Assistant Section */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6">🤖 Hỏi AI trợ lý</h2>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Hỏi gì về khóa học cũng được..."
                                className="w-full h-32 border border-gray-300 p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
                                disabled={aiLoading}
                            />
                            <button
                                onClick={askAI}
                                disabled={aiLoading}
                                className="mt-4 w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-bold"
                            >
                                {aiLoading ? "Đang hỏi AI..." : "Hỏi AI"}
                            </button>

                            {answer && (
                                <div className="mt-6 bg-purple-50 border border-purple-200 p-6 rounded-lg">
                                    <p className="text-gray-800 leading-relaxed">{answer}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {enrollments.length > 0 && (
                    <div className="mt-12 grid grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow text-center">
                            <p className="text-3xl font-bold text-blue-600">{enrollments.length}</p>
                            <p className="text-gray-600 mt-2">Khóa học đã đăng ký</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow text-center">
                            <p className="text-3xl font-bold text-green-600">
                                {Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)}%
                            </p>
                            <p className="text-gray-600 mt-2">Tiến độ trung bình</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow text-center">
                            <p className="text-3xl font-bold text-purple-600">
                                {enrollments.filter((e) => e.progress === 100).length}
                            </p>
                            <p className="text-gray-600 mt-2">Khóa đã hoàn thành</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}