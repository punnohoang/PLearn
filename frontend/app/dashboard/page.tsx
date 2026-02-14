'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        api.get('/enrollments').then(res => setEnrollments(res.data));
    }, []);

    const askAI = async () => {
        const res = await api.post('/ai/ask', {
            question,
            context: `Bạn đang học khóa ${enrollments[0]?.course.title || 'PLearn'}`
        });
        setAnswer(res.data);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Dashboard - Tiến độ học tập</h1>

            <div className="grid grid-cols-2 gap-8">
                {/* Tiến độ */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Khóa học của bạn</h2>
                    {enrollments.map(en => (
                        <div key={en.id} className="bg-white p-6 rounded-2xl shadow mb-6">
                            <h3 className="font-bold text-xl">{en.course.title}</h3>
                            <div className="mt-4 bg-gray-200 h-3 rounded-full overflow-hidden">
                                <div
                                    className="bg-green-500 h-full transition-all"
                                    style={{ width: `${en.progress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{en.progress}% hoàn thành</p>
                        </div>
                    ))}
                </div>

                {/* AI Assistant */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">AI Trợ lý học tập</h2>
                    <textarea
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        placeholder="Hỏi gì về khóa học cũng được..."
                        className="w-full h-32 border p-4 rounded-xl"
                    />
                    <button
                        onClick={askAI}
                        className="mt-4 bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700"
                    >
                        Hỏi AI
                    </button>

                    {answer && (
                        <div className="mt-6 bg-purple-50 p-6 rounded-2xl border border-purple-200">
                            <p className="text-purple-800">{answer}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}