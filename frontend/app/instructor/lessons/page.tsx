'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navigation';
import VideoUploadModal from '@/components/VideoUploadModal';

interface Lesson {
    id: string;
    title: string;
    videoUrl: string | null;
    courseId: string;
    order: number;
    course: {
        title: string;
    };
}

export default function InstructorLessonsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'INSTRUCTOR') {
            router.push('/dashboard');
        } else {
            loadData();
        }
    }, [user, router]);

    const loadData = async () => {
        try {
            setLoading(true);
            const coursesRes = await api.get('/courses');
            const userCourses = coursesRes.data.filter((c: any) => c.instructorId === user?.id);
            setCourses(userCourses);

            if (userCourses.length > 0) {
                setSelectedCourse(userCourses[0].id);
                const lessonsRes = await api.get(`/lessons/${userCourses[0].id}`);
                setLessons(lessonsRes.data);
            }
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = async (courseId: string) => {
        setSelectedCourse(courseId);
        try {
            const lessonsRes = await api.get(`/lessons/${courseId}`);
            setLessons(lessonsRes.data);
        } catch (err) {
            console.error('Error loading lessons:', err);
        }
    };

    const handleVideoUpload = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setShowVideoModal(true);
    };

    const handleVideoSuccess = async () => {
        if (selectedCourse) {
            const lessonsRes = await api.get(`/lessons/${selectedCourse}`);
            setLessons(lessonsRes.data);
        }
    };

    const handleRemoveVideo = async (lessonId: string) => {
        if (!confirm('Xóa video này?')) return;

        try {
            await api.patch(`/lessons/${lessonId}/video`, { videoUrl: null });
            if (selectedCourse) {
                const lessonsRes = await api.get(`/lessons/${selectedCourse}`);
                setLessons(lessonsRes.data);
            }
        } catch (err) {
            console.error('Error removing video:', err);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-600">⏳ Đang tải...</div>;
    }

    if (!user || user.role !== 'INSTRUCTOR') {
        return null;
    }

    const filteredLessons = selectedCourse ? lessons.filter(l => l.courseId === selectedCourse) : lessons;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-8 pt-24">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">📹 Quản lý Video Bài học</h1>
                    <p className="text-green-100">Tải video cho các bài học của bạn</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-8">
                {/* Course Selection */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">📚 Chọn Khóa học</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {courses.map((course) => (
                            <button
                                key={course.id}
                                onClick={() => handleCourseChange(course.id)}
                                className={`p-4 rounded-lg border-2 transition text-left ${selectedCourse === course.id
                                        ? 'border-green-600 bg-green-50'
                                        : 'border-gray-200 hover:border-green-300'
                                    }`}
                            >
                                <p className="font-bold text-lg">{course.title}</p>
                                <p className="text-sm text-gray-600">
                                    {filteredLessons.length} bài học
                                </p>
                            </button>
                        ))}
                    </div>

                    {courses.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            <p>Bạn chưa tạo khóa học nào</p>
                        </div>
                    )}
                </div>

                {/* Lessons List */}
                {selectedCourse && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold">📖 Bài học ({filteredLessons.length})</h2>
                        </div>

                        {filteredLessons.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                Không có bài học nào trong khóa học này
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredLessons.map((lesson) => (
                                    <div key={lesson.id} className="p-6 hover:bg-gray-50 transition">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                                        Bài {lesson.order}
                                                    </span>
                                                    {lesson.videoUrl && (
                                                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                                            🎬 Có video
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold">{lesson.title}</h3>
                                            </div>
                                        </div>

                                        {/* Video Preview */}
                                        {lesson.videoUrl && (
                                            <div className="mb-4 bg-gray-100 rounded-lg p-4">
                                                <p className="text-sm text-gray-600 mb-2">URL Video:</p>
                                                <div className="bg-white p-2 rounded border border-gray-300 mb-3 break-all text-xs text-gray-700 font-mono">
                                                    {lesson.videoUrl}
                                                </div>

                                                {/* Video Preview Thumbnail */}
                                                {lesson.videoUrl.includes('youtube') && (
                                                    <div className="mb-3 rounded overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
                                                        <iframe
                                                            width="100%"
                                                            height="100%"
                                                            src={lesson.videoUrl}
                                                            title={lesson.title}
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleVideoUpload(lesson)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
                                            >
                                                {lesson.videoUrl ? '🔄 Thay đổi Video' : '📹 Thêm Video'}
                                            </button>
                                            {lesson.videoUrl && (
                                                <button
                                                    onClick={() => handleRemoveVideo(lesson.id)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition"
                                                >
                                                    🗑️ Xóa Video
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Video Upload Modal */}
            {selectedLesson && (
                <VideoUploadModal
                    isOpen={showVideoModal}
                    lessonId={selectedLesson.id}
                    lessonTitle={selectedLesson.title}
                    onClose={() => setShowVideoModal(false)}
                    onSuccess={handleVideoSuccess}
                />
            )}
        </div>
    );
}
