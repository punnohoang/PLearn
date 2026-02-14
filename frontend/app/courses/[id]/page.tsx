"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = params.id as string;
    const [course, setCourse] = useState<any>(null);
    const [enrolled, setEnrolled] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadCourse();
        if (user) checkEnrollment();
    }, [courseId, user]);

    const loadCourse = async () => {
        try {
            const res = await api.get(`/courses/${courseId}`);
            setCourse(res.data);
        } catch (err) {
            console.error("Không thể tải khóa học");
        } finally {
            setLoading(false);
        }
    };

    const checkEnrollment = async () => {
        try {
            const enrollments = await api.get("/enrollments");
            const enrollment = enrollments.data.find((e: any) => e.course.id === courseId);
            if (enrollment) {
                setEnrolled(true);
                setProgress(enrollment.progress);
            }
        } catch (err) {
            console.error("Lỗi kiểm tra đăng ký");
        }
    };

    const handleEnroll = async () => {
        try {
            await api.post("/enrollments", { courseId });
            setEnrolled(true);
        } catch (err: any) {
            alert(err.response?.data?.message || "Không thể đăng ký");
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;
    if (!course) return <div className="p-8 text-center">Không tìm thấy khóa học</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-blue-600 text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/courses" className="text-blue-100 hover:text-white mb-4 inline-block">
                        ← Quay lại
                    </Link>
                    <h1 className="text-4xl font-bold">{course.title}</h1>
                    <p className="text-blue-100 mt-2">Giảng viên: {course.instructor.name}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-8">
                {/* Course Info */}
                <div className="bg-white p-8 rounded-lg shadow mb-8">
                    <h2 className="text-2xl font-bold mb-4">Mô tả</h2>
                    <p className="text-gray-700 mb-6">{course.description}</p>

                    {/* Progress */}
                    {enrolled && (
                        <div className="mb-6">
                            <h3 className="font-bold mb-2">Tiến độ của bạn</h3>
                            <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden">
                                <div
                                    className="bg-green-500 h-full transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{progress}% hoàn thành</p>
                        </div>
                    )}

                    {/* Action Button */}
                    {!enrolled && user && (
                        <button
                            onClick={handleEnroll}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                        >
                            Đăng ký khóa học
                        </button>
                    )}

                    {!user && (
                        <Link href="/login">
                            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                                Đăng nhập để đăng ký
                            </button>
                        </Link>
                    )}
                </div>

                {/* Lessons */}
                {course.lessons && course.lessons.length > 0 && (
                    <div className="bg-white p-8 rounded-lg shadow">
                        <h2 className="text-2xl font-bold mb-6">📖 Bài học ({course.lessons.length})</h2>
                        <div className="space-y-4">
                            {course.lessons.map((lesson: any) => (
                                <div key={lesson.id} className="border-l-4 border-blue-600 pl-4 py-4 hover:bg-gray-50 transition rounded">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{lesson.order}. {lesson.title}</h3>
                                            <p className="text-gray-600 text-sm mt-1">{lesson.content?.substring(0, 100) || "Không có mô tả"}...</p>
                                            {lesson.duration && (
                                                <p className="text-gray-500 text-xs mt-2">⏱️ {lesson.duration} phút</p>
                                            )}
                                        </div>
                                        {enrolled ? (
                                            <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                                                <button className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm whitespace-nowrap">
                                                    Học bài →
                                                </button>
                                            </Link>
                                        ) : (
                                            <div className="ml-4 text-xs text-gray-500">
                                                Đăng ký để mở
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Enrollments Count */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow text-center">
                    <p className="text-gray-600">
                        <strong>{course.enrollments?.length || 0}</strong> học viên đã đăng ký khóa học này
                    </p>
                </div>
            </div>
        </div>
    );
}
