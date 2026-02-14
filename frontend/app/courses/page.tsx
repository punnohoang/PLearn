"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Courses() {
    const [courses, setCourses] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const { logout } = useAuth();

    useEffect(() => {
        api.get("/courses").then((res) => setCourses(res.data));
    }, []);

    const createCourse = async () => {
        await api.post("/courses", { title, description });
        window.location.reload();
    };

    return (
        <div className="p-8">
            <div className="flex justify-between mb-8">
                <h1 className="text-3xl font-bold">Khóa học của tôi</h1>
                <button onClick={logout} className="text-red-600">Đăng xuất</button>
            </div>

            <div className="mb-8">
                <input
                    placeholder="Tên khóa học"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border p-3 mr-4"
                />
                <input
                    placeholder="Mô tả"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border p-3 mr-4"
                />
                <button onClick={createCourse} className="bg-green-600 text-white px-6 py-3 rounded">Tạo khóa học</button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="border p-6 rounded-xl">
                        <h3 className="font-semibold text-xl">{course.title}</h3>
                        <p className="text-gray-600 mt-2">{course.description}</p>
                        <p className="text-sm text-gray-500 mt-4">Giảng viên: {course.instructor.name}</p>
                    </div>
                ))}
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Bài học</h2>
                <input placeholder="Course ID" id="courseId" className="border p-2" />
                <button
                    onClick={async () => {
                        const id = (document.getElementById('courseId') as HTMLInputElement).value;
                        const res = await api.get(`/lessons/${id}`);
                        console.log(res.data);
                        alert('Xem console');
                    }}
                    className="ml-4 bg-blue-600 text-white px-4 py-2"
                >
                    Xem bài học
                </button>
            </div>
        </div>
    );
}
