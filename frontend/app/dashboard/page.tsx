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
    const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string }>>([]);
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
            setChatHistory([...chatHistory, { q: question, a: res.data }]);
            setQuestion("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Lỗi khi hỏi AI");
        } finally {
            setAiLoading(false);
        }
    };

    // Calculate statistics
    const completedCourses = enrollments.filter((e: any) => e.progress === 100).length;
    const inProgressCourses = enrollments.filter((e: any) => e.progress > 0 && e.progress < 100).length;
    const avgProgress = enrollments.length > 0 
        ? Math.round(enrollments.reduce((sum: number, e: any) => sum + e.progress, 0) / enrollments.length)
        : 0;
    const totalHours = enrollments.length * 10; // Estimate: 10 hours per course

    if (loading) {
        return <div className="p-8 text-center text-gray-600">⏳ Đang tải dữ liệu...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">📊 Bảng điều khiển học tập</h1>
                    <p className="text-blue-100">Xem tiến độ, thuy thức kế hoạch, và nhắn hỏi AI</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        ⚠️ {error}
                    </div>
                )}

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600 text-sm font-semibold mb-2">KHÓA HỌC THAM GIA</p>
                        <p className="text-4xl font-bold text-blue-600">{enrollments.length}</p>
                        <p className="text-xs text-gray-500 mt-2">📚 Khóa học</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600 text-sm font-semibold mb-2">ĐÃ HOÀN THÀNH</p>
                        <p className="text-4xl font-bold text-green-600">{completedCourses}</p>
                        <p className="text-xs text-gray-500 mt-2">✅ Khóa học</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600 text-sm font-semibold mb-2">ĐANG HỌC</p>
                        <p className="text-4xl font-bold text-yellow-600">{inProgressCourses}</p>
                        <p className="text-xs text-gray-500 mt-2">📖 Khóa học</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600 text-sm font-semibold mb-2">TIẾN ĐỘ TRUNG BÌNH</p>
                        <p className="text-4xl font-bold text-purple-600">{avgProgress}%</p>
                        <p className="text-xs text-gray-500 mt-2">📈 Trung bình</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Learning Progress Section */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-6">📚 Khóa học của bạn</h2>

                        {enrollments.length === 0 ? (
                            <div className="bg-white p-8 rounded-lg shadow text-center">
                                <p className="text-gray-600 mb-4 text-lg">🎯 Bạn chưa đăng ký khóa học nào</p>
                                <Link href="/courses">
                                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                                        Khám phá khóa học
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
                                                <span className={`text-sm font-bold px-3 py-1 rounded ${
                                                    enrollment.progress === 100 ? 'bg-green-100 text-green-800' :
                                                    enrollment.progress >= 50 ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {enrollment.progress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${
                                                        enrollment.progress === 100 ? 'bg-green-500' :
                                                        enrollment.progress >= 50 ? 'bg-blue-500' :
                                                        'bg-yellow-500'
                                                    }`}
                                                    style={{ width: `${enrollment.progress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                👨‍🏫 {enrollment.course.instructor.name} • 📚 {enrollment.course._count?.lessons || 0} bài học
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* AI Assistant Section */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">🤖 Trợ lý AI</h2>
                        <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
                            <div className="flex-1 mb-4 space-y-4 max-h-96 overflow-y-auto">
                                {chatHistory.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-8">
                                        💬 Hỏi tôi bất cứ điều gì về bài học của bạn!
                                    </p>
                                ) : (
                                    chatHistory.map((chat, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="bg-blue-100 p-3 rounded-lg text-sm">
                                                <p className="text-blue-900">❓ {chat.q}</p>
                                            </div>
                                            <div className="bg-gray-100 p-3 rounded-lg text-sm">
                                                <p className="text-gray-800">✅ {chat.a}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {answer && chatHistory.length === 0 && (
                                    <div className="bg-gray-100 p-3 rounded-lg text-sm">
                                        <p className="text-gray-800">✅ {answer}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Hỏi AI..."
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && askAI()}
                                    className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    disabled={aiLoading}
                                />
                                <button
                                    onClick={askAI}
                                    disabled={aiLoading || !question.trim()}
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-sm transition"
                                >
                                    {aiLoading ? "⏳ Đang xử lý..." : "Gửi"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
