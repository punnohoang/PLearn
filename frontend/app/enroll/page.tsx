'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function Enroll() {
    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        api.get('/courses').then(res => setCourses(res.data));
    }, []);

    const enroll = async (courseId: string) => {
        await api.post('/enrollments', { courseId });
        alert('Đăng ký thành công!');
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Đăng ký khóa học</h1>
            <div className="grid grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="border p-6 rounded-xl">
                        <h3>{course.title}</h3>
                        <button
                            onClick={() => enroll(course.id)}
                            className="mt-4 bg-green-600 text-white px-6 py-2 rounded"
                        >
                            Đăng ký ngay
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}