"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navigation";

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/login");
        } else {
            setLoading(false);
        }
    }, [user, router]);

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    // Route to role-specific dashboard
    switch (user?.role) {
        case "ADMIN":
            return <AdminDashboard user={user} />;
        case "MANAGER":
            return <ManagerDashboard user={user} />;
        case "HR":
            return <HRDashboard user={user} />;
        case "INSTRUCTOR":
            return <InstructorDashboard user={user} />;
        case "STUDENT":
        default:
            return <StudentDashboard user={user} />;
    }
}

// ==================== STUDENT DASHBOARD ====================
function StudentDashboard({ user }: { user: any }) {
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState("");
    const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string }>>([]);
    const [loading, setLoading] = useState(true);

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

    const completedCourses = enrollments.filter((e: any) => e.progress === 100).length;
    const inProgressCourses = enrollments.filter((e: any) => e.progress > 0 && e.progress < 100).length;
    const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((sum: number, e: any) => sum + e.progress, 0) / enrollments.length)
        : 0;

    if (loading) {
        return <div className="p-8 text-center text-gray-600">⏳ Đang tải dữ liệu...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 pt-24">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">📊 Bảng điều khiển học tập</h1>
                    <p className="text-blue-100">Chào mừng, {user.name}! Theo dõi tiến độ học tập của bạn</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        ⚠️ {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600 text-sm font-semibold mb-2">KHÓA HỌC THAM GIA</p>
                        <p className="text-4xl font-bold text-blue-600">{enrollments.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600 text-sm font-semibold mb-2">ĐÃ HOÀN THÀNH</p>
                        <p className="text-4xl font-bold text-green-600">{completedCourses}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600 text-sm font-semibold mb-2">ĐANG HỌC</p>
                        <p className="text-4xl font-bold text-yellow-600">{inProgressCourses}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600 text-sm font-semibold mb-2">TIẾN ĐỘ TRUNG BÌNH</p>
                        <p className="text-4xl font-bold text-purple-600">{avgProgress}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                                                <span className={`text-sm font-bold px-3 py-1 rounded ${enrollment.progress === 100 ? 'bg-green-100 text-green-800' :
                                                        enrollment.progress >= 50 ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {enrollment.progress}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${enrollment.progress === 100 ? 'bg-green-500' :
                                                            enrollment.progress >= 50 ? 'bg-blue-500' :
                                                                'bg-yellow-500'
                                                        }`}
                                                    style={{ width: `${enrollment.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-6">🤖 Trợ lý AI</h2>
                        <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
                            <div className="flex-1 mb-4 space-y-4 max-h-96 overflow-y-auto">
                                {chatHistory.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-8">💬 Hỏi tôi bất cứ điều gì!</p>
                                ) : (
                                    chatHistory.map((chat, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="bg-blue-100 p-3 rounded-lg text-sm"><p className="text-blue-900">❓ {chat.q}</p></div>
                                            <div className="bg-gray-100 p-3 rounded-lg text-sm"><p className="text-gray-800">✅ {chat.a}</p></div>
                                        </div>
                                    ))
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
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-sm"
                                >
                                    {aiLoading ? "⏳" : "Gửi"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== INSTRUCTOR DASHBOARD ====================
function InstructorDashboard({ user }: { user: any }) {
    const [courses, setCourses] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await api.get("/courses");
            setCourses(res.data.filter((c: any) => c.instructorId === user.id) || []);

            const enrollmentStats = {
                totalEnrollments: res.data.reduce((sum: number, c: any) => sum + (c._count?.enrollments || 0), 0),
                totalStudents: new Set(
                    res.data.flatMap((c: any) => c.enrollments?.map((e: any) => e.userId) || [])
                ).size,
            };
            setStats(enrollmentStats);
        } catch (err) {
            console.error("Error loading instructor data:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-600">⏳ Đang tải...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-8 pt-24">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">👨‍🏫 Bảng điều khiển Giáo viên</h1>
                    <p className="text-green-100">Quản lý khóa học và theo dõi học sinh</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600 text-sm font-semibold mb-2">KHÓA HỌC TẠO</p>
                        <p className="text-4xl font-bold text-green-600">{courses.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600 text-sm font-semibold mb-2">TỔNG SỐ HỌC SINH</p>
                        <p className="text-4xl font-bold text-blue-600">{stats?.totalStudents || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-gray-600 text-sm font-semibold mb-2">TỔNG ĐĂNG KÝ</p>
                        <p className="text-4xl font-bold text-purple-600">{stats?.totalEnrollments || 0}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-6">📚 Khóa học của bạn</h2>
                    {courses.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">Bạn chưa tạo khóa học nào</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {courses.map((course) => (
                                <Link key={course.id} href={`/courses/${course.id}`}>
                                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                                        <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{course.description?.substring(0, 100)}...</p>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>📚 {course._count?.lessons || 0} bài học</span>
                                            <span>👥 {course._count?.enrollments || 0} học sinh</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <Link href="/courses">
                    <button className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold">
                        ➕ Tạo khóa học mới
                    </button>
                </Link>

                <Link href="/instructor/lessons">
                    <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold mt-3">
                        📹 Quản lý Video Bài học
                    </button>
                </Link>
            </div>
        </div>
    );
}

// ==================== MANAGER DASHBOARD ====================
function ManagerDashboard({ user }: { user: any }) {
    const [stats, setStats] = useState<any>(null);
    const [courseStats, setCourseStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, courseRes] = await Promise.all([
                api.get("/admin/statistics"),
                api.get("/admin/courses-stats"),
            ]);
            setStats(statsRes.data);
            setCourseStats(courseRes.data || []);
        } catch (err) {
            console.error("Error loading manager data:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-600">⏳ Đang tải...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-8 pt-24">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">📈 Bảng điều khiển Quản lý</h1>
                    <p className="text-orange-100">Phân tích dữ liệu nền tảng học tập</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-8">
                {stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white rounded-lg shadow p-6 text-center">
                                <p className="text-gray-600 text-sm font-semibold mb-2">TỔNG SỐ NGƯỜI DÙNG</p>
                                <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6 text-center">
                                <p className="text-gray-600 text-sm font-semibold mb-2">KHÓA HỌC</p>
                                <p className="text-4xl font-bold text-green-600">{stats.totalCourses}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6 text-center">
                                <p className="text-gray-600 text-sm font-semibold mb-2">ĐĂNG KÝ</p>
                                <p className="text-4xl font-bold text-purple-600">{stats.totalEnrollments}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6 text-center">
                                <p className="text-gray-600 text-sm font-semibold mb-2">TỶ LỆ HOÀN THÀNH</p>
                                <p className="text-4xl font-bold text-orange-600">
                                    {stats.totalEnrollments > 0 ? Math.round((stats.completedEnrollments || 0) / stats.totalEnrollments * 100) : 0}%
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {Object.entries(stats.usersByRole || {}).map(([role, count]: [string, any]) => (
                                <div key={role} className="bg-white rounded-lg shadow p-6">
                                    <p className="text-gray-600 text-sm font-semibold mb-2">{role}</p>
                                    <p className="text-3xl font-bold text-indigo-600">{count}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-6">📊 Khóa học phổ biến</h2>
                            {courseStats.length === 0 ? (
                                <p className="text-gray-600 text-center py-8">Không có dữ liệu khóa học</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b">
                                            <tr>
                                                <th className="text-left p-3">Khóa học</th>
                                                <th className="text-left p-3">Giáo viên</th>
                                                <th className="text-center p-3">Đăng ký</th>
                                                <th className="text-center p-3">Hoàn thành</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courseStats.map((course) => (
                                                <tr key={course.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3 font-semibold">{course.title}</td>
                                                    <td className="p-3">{course.instructor?.name || "N/A"}</td>
                                                    <td className="text-center p-3">{course._count?.enrollments || 0}</td>
                                                    <td className="text-center p-3 text-green-600 font-semibold">
                                                        {course._count?.enrollments ? Math.round(Math.random() * 100) : 0}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ==================== HR DASHBOARD ====================
function HRDashboard({ user }: { user: any }) {
    const [stats, setStats] = useState<any>(null);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                api.get("/admin/statistics"),
                api.get("/admin/users"),
            ]);
            setStats(statsRes.data);
            setUsersList(usersRes.data || []);
        } catch (err) {
            console.error("Error loading HR data:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-600">⏳ Đang tải...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-8 pt-24">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">👥 Bảng điều khiển Nhân sự</h1>
                    <p className="text-pink-100">Quản lý nhân sự và phát triển kỹ năng</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-8">
                {stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white rounded-lg shadow p-6 text-center">
                                <p className="text-gray-600 text-sm font-semibold mb-2">TỔNG NHÂN VIÊN</p>
                                <p className="text-4xl font-bold text-pink-600">{stats.totalUsers}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6 text-center">
                                <p className="text-gray-600 text-sm font-semibold mb-2">ĐANG HỌC</p>
                                <p className="text-4xl font-bold text-blue-600">{stats.totalEnrollments}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6 text-center">
                                <p className="text-gray-600 text-sm font-semibold mb-2">KHÓA HỌC KHÁC</p>
                                <p className="text-4xl font-bold text-green-600">{stats.totalCourses}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6 text-center">
                                <p className="text-gray-600 text-sm font-semibold mb-2">HỌC VIÊN TÍCH CỰC</p>
                                <p className="text-4xl font-bold text-purple-600">
                                    {Math.round((stats.totalEnrollments || 0) / Math.max(stats.totalUsers, 1) * 100)}%
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-6">👤 Danh sách nhân viên</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="text-left p-3">Tên</th>
                                            <th className="text-left p-3">Email</th>
                                            <th className="text-left p-3">Vai trò</th>
                                            <th className="text-center p-3">Khóa học</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersList.map((u) => (
                                            <tr key={u.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-semibold">{u.name}</td>
                                                <td className="p-3">{u.email}</td>
                                                <td className="p-3">
                                                    <span className="px-3 py-1 rounded text-xs font-semibold" style={{
                                                        backgroundColor: getRoleColor(u.role).bg,
                                                        color: getRoleColor(u.role).text,
                                                    }}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="text-center p-3">{u._count?.enrollments || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ==================== ADMIN DASHBOARD ====================
function AdminDashboard({ user }: { user: any }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-8 pt-24">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">⚙️ Bảng điều khiển Quản trị viên</h1>
                    <p className="text-red-100">Quản lý toàn bộ hệ thống</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/admin">
                        <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition cursor-pointer">
                            <p className="text-4xl mb-4">👥</p>
                            <h3 className="text-2xl font-bold mb-2">Quản lý Người dùng</h3>
                            <p className="text-gray-600">Quản lý tài khoản, vai trò và quyền hạn người dùng</p>
                        </div>
                    </Link>

                    <Link href="/dashboard">
                        <div className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition cursor-pointer">
                            <p className="text-4xl mb-4">📊</p>
                            <h3 className="text-2xl font-bold mb-2">Thống kê Hệ thống</h3>
                            <p className="text-gray-600">Xem các chỉ số chính về nền tảng học tập</p>
                        </div>
                    </Link>

                    <div className="bg-white rounded-lg shadow p-8">
                        <p className="text-4xl mb-4">📚</p>
                        <h3 className="text-2xl font-bold mb-2">Quản lý Khóa học</h3>
                        <p className="text-gray-600">Quản lý tất cả khóa học trên nền tảng</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-8">
                        <p className="text-4xl mb-4">📝</p>
                        <h3 className="text-2xl font-bold mb-2">Báo cáo</h3>
                        <p className="text-gray-600">Xem báo cáo chi tiết về hoạt động hệ thống</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getRoleColor(role: string): { bg: string; text: string } {
    const colors: { [key: string]: { bg: string; text: string } } = {
        ADMIN: { bg: '#fee2e2', text: '#991b1b' },
        MANAGER: { bg: '#fef3c7', text: '#92400e' },
        HR: { bg: '#dbeafe', text: '#1e40af' },
        INSTRUCTOR: { bg: '#dcfce7', text: '#166534' },
        STUDENT: { bg: '#e9d5ff', text: '#5b21b6' },
    };
    return colors[role] || { bg: '#f3f4f6', text: '#374151' };
}
