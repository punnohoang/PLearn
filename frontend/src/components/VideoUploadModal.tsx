'use client';

import { useState } from 'react';
import api from '../lib/api';

interface VideoUploadModalProps {
    isOpen: boolean;
    lessonId: string;
    lessonTitle: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function VideoUploadModal({
    isOpen,
    lessonId,
    lessonTitle,
    onClose,
    onSuccess,
}: VideoUploadModalProps) {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoType, setVideoType] = useState('youtube'); // youtube, mp4, html5
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!videoUrl.trim()) {
            setError('Vui lòng nhập URL video');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let finalUrl = videoUrl;

            // Format YouTube URL
            if (videoType === 'youtube') {
                let videoId = videoUrl;
                if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                    const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
                    if (match) {
                        videoId = match[1];
                    }
                }
                finalUrl = `https://www.youtube.com/embed/${videoId}`;
            }

            await api.patch(`/lessons/${lessonId}/video`, {
                videoUrl: finalUrl,
            });

            setVideoUrl('');
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi tải video');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">📹 Thêm Video cho Bài học</h2>
                <p className="text-gray-600 mb-6 text-sm">{lessonTitle}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Video Type Selection */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Loại Video</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'youtube', label: '🎬 YouTube' },
                                { value: 'mp4', label: '📹 MP4' },
                                { value: 'html5', label: '🎥 HTML5' },
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setVideoType(type.value)}
                                    className={`p-2 rounded-lg text-sm font-semibold transition ${videoType === type.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Video URL Input */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            {videoType === 'youtube' ? 'YouTube URL hoặc ID' : 'Video URL'}
                        </label>
                        <input
                            type="text"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder={
                                videoType === 'youtube'
                                    ? 'https://youtube.com/watch?v=... hoặc dQw4w9WgXcQ'
                                    : 'https://example.com/video.mp4'
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>

                    {/* Help Text */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                        {videoType === 'youtube' && (
                            <>
                                <p className="font-semibold mb-1">📌 YouTube:</p>
                                <p>• Dán toàn bộ URL: https://youtube.com/watch?v=dQw4w9WgXcQ</p>
                                <p>• Hoặc chỉ ID video: dQw4w9WgXcQ</p>
                            </>
                        )}
                        {videoType === 'mp4' && (
                            <>
                                <p className="font-semibold mb-1">📌 MP4:</p>
                                <p>• Dán URL đầy đủ: https://example.com/video.mp4</p>
                                <p>• Hoặc URL từ Cloudinary, AWS S3, v.v.</p>
                            </>
                        )}
                        {videoType === 'html5' && (
                            <>
                                <p className="font-semibold mb-1">📌 HTML5:</p>
                                <p>• Dán URL video WebM, MP4, hoặc Ogg</p>
                            </>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                            ❌ {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? '⏳ Đang xử lý...' : '✅ Lưu Video'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
