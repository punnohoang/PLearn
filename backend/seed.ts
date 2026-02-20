import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Seeding database...');

    // 1. Create instructor user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const instructor = await prisma.user.upsert({
        where: { email: 'python-instructor@example.com' },
        update: {},
        create: {
            email: 'python-instructor@example.com',
            password: hashedPassword,
            name: 'Thầy Python',
            role: 'INSTRUCTOR',
        },
    });
    console.log('✅ Instructor created:', instructor.name);

    // 2. Create Python course
    const pythonCourse = await prisma.course.upsert({
        where: { id: 'python-course-001' },
        update: {},
        create: {
            id: 'python-course-001',
            title: 'Lập trình Python từ cơ bản đến nâng cao',
            description:
                'Khóa học Python toàn diện cho người mới bắt đầu. Học Python từ A-Z, từ những kiến thức cơ bản như biến, kiểu dữ liệu, cho đến các chủ đề nâng cao như lập trình hướng đối tượng, xử lý file, web scraping, và phát triển ứng dụng thực tế.',
            instructorId: instructor.id,
        },
    });
    console.log('✅ Python course created:', pythonCourse.title);

    // 3. Create lessons
    const lessons = [
        {
            title: 'Giới thiệu về Python',
            content:
                '<h3>Python là gì?</h3><p>Python là một ngôn ngữ lập trình cấp cao, dễ học và mạnh mẽ. Nó được sử dụng rộng rãi trong data science, machine learning, web development, và nhiều lĩnh vực khác.</p><h3>Tại sao học Python?</h3><ul><li>Cú pháp đơn giản và dễ hiểu</li><li>Có thư viện phong phú</li><li>Cộng đồng lớn và hỗ trợ tốt</li><li>Được sử dụng ở các công ty tech lớn</li></ul>',
            order: 1,
        },
        {
            title: 'Cài đặt Python và môi trường lập trình',
            content:
                '<h3>Cài đặt Python</h3><p>Tải Python từ python.org và cài đặt phiên bản mới nhất (3.11+).</p><h3>IDE và Editor</h3><ul><li>PyCharm - IDE chuyên dụng cho Python</li><li>VS Code - Editor nhẹ nhàng và mạnh mẽ</li><li>Jupyter Notebook - Tuyệt vời cho data science</li></ul>',
            order: 2,
        },
        {
            title: 'Biến, kiểu dữ liệu và toán tử',
            content:
                '<h3>Biến (Variables)</h3><p>Biến là tên được dùng để lưu trữ giá trị. Trong Python, bạn không cần khai báo kiểu dữ liệu trước:</p><pre>name = "Hoàng"\nage = 25\nheight = 1.75</pre><h3>Kiểu dữ liệu cơ bản</h3><ul><li>int - Số nguyên: 42, -10</li><li>float - Số thực: 3.14, -0.5</li><li>str - Chuỗi: "Hello", \'Python\'</li><li>bool - Giá trị logic: True, False</li></ul><h3>Toán tử</h3><ul><li>Số học: +, -, *, /, //, %</li><li>So sánh: ==, !=, >, <, >=, <=</li><li>Logic: and, or, not</li></ul>',
            order: 3,
        },
        {
            title: 'Điều kiện và vòng lặp',
            content:
                '<h3>Câu lệnh if-else</h3><pre>age = 18\nif age >= 18:\n    print("Bạn đã trưởng thành")\nelse:\n    print("Bạn chưa trưởng thành")</pre><h3>Vòng lặp for</h3><pre>for i in range(5):\n    print(i)</pre><h3>Vòng lặp while</h3><pre>count = 0\nwhile count < 5:\n    print(count)\n    count += 1</pre>',
            order: 4,
        },
        {
            title: 'Hàm (Functions)',
            content:
                '<h3>Định nghĩa hàm</h3><pre>def greet(name):\n    return f"Xin chào, {name}!"</pre><h3>Gọi hàm</h3><pre>message = greet("Hoàng")\nprint(message)</pre><h3>Hàm với nhiều tham số</h3><pre>def add(a, b):\n    return a + b\n\nresult = add(5, 3)</pre><h3>Default parameters</h3><pre>def greet(name="Bạn"):\n    return f"Xin chào, {name}!"</pre>',
            order: 5,
        },
        {
            title: 'Danh sách (Lists) và Từ điển (Dictionaries)',
            content:
                '<h3>Danh sách (Lists)</h3><pre>fruits = ["Apple", "Banana", "Orange"]\nprint(fruits[0])\nfruits.append("Mango")\nfor fruit in fruits:\n    print(fruit)</pre><h3>Từ điển (Dictionaries)</h3><pre>student = {\n    "name": "Hoàng",\n    "age": 20,\n    "grade": "A"\n}\nprint(student["name"])\nstudent["age"] = 21</pre><h3>List comprehension</h3><pre>squares = [x**2 for x in range(5)]\nprint(squares)</pre>',
            order: 6,
        },
        {
            title: 'Xử lý tệp (File Handling)',
            content:
                '<h3>Đọc file</h3><pre>with open("file.txt", "r") as file:\n    content = file.read()\n    print(content)</pre><h3>Ghi file</h3><pre>with open("file.txt", "w") as file:\n    file.write("Hello, World!")</pre><h3>Thêm vào file</h3><pre>with open("file.txt", "a") as file:\n    file.write("\\nNew line")</pre>',
            order: 7,
        },
        {
            title: 'Lập trình hướng đối tượng (OOP)',
            content:
                '<h3>Định nghĩa class</h3><pre>class Car:\n    def __init__(self, brand, model):\n        self.brand = brand\n        self.model = model\n    \n    def display_info(self):\n        print(f"{self.brand} {self.model}")</pre><h3>Tạo object</h3><pre>car = Car("Toyota", "Camry")\ncar.display_info()</pre><h3>Kế thừa</h3><pre>class ElectricCar(Car):\n    def __init__(self, brand, model, battery):\n        super().__init__(brand, model)\n        self.battery = battery</pre>',
            order: 8,
        },
        {
            title: 'Xử lý lỗi (Error Handling)',
            content:
                '<h3>Try-except block</h3><pre>try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Không thể chia cho 0!")\nexcept Exception as e:\n    print(f"Lỗi: {e}")\nfinally:\n    print("Xong")</pre><h3>Raising exceptions</h3><pre>def validate_age(age):\n    if age < 0:\n        raise ValueError("Tuổi không thể âm")\n    return age</pre>',
            order: 9,
        },
        {
            title: 'Project: Ứng dụng Quản lý Danh bạ',
            content:
                '<h3>Mô tả project</h3><p>Xây dựng một ứng dụng quản lý danh bạ với các chức năng:</p><ul><li>Thêm liên hệ mới</li><li>Xem danh sách liên hệ</li><li>Tìm kiếm liên hệ</li><li>Xóa liên hệ</li><li>Lưu/Tải danh bạ từ file</li></ul><h3>Yêu cầu</h3><ul><li>Sử dụng class để quản lý danh bạ</li><li>Xử lý file JSON</li><li>Giao diện command-line đơn giản</li></ul>',
            order: 10,
        },
    ];

    for (const lesson of lessons) {
        await prisma.lesson.create({
            data: {
                ...lesson,
                courseId: pythonCourse.id,
            },
        });
    }
    console.log(`✅ ${lessons.length} lessons created`);

    console.log('✅ Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
