import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from '../common/dto/create-course.dto';

@Injectable()
export class CoursesService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateCourseDto, instructorId: string) {
        return await this.prisma.course.create({
            data: { ...dto, instructorId },
            include: { instructor: true, lessons: true, enrollments: true },
        });
    }

    async findAll() {
        return await this.prisma.course.findMany({
            include: { instructor: true, lessons: true, _count: { select: { enrollments: true } } },
        });
    }

    async findOne(id: string) {
        return await this.prisma.course.findUnique({
            where: { id },
            include: {
                instructor: true,
                lessons: { orderBy: { order: 'asc' } },
                enrollments: { include: { user: true } },
            },
        });
    }

    async update(id: string, dto: CreateCourseDto) {
        return await this.prisma.course.update({
            where: { id },
            data: dto,
            include: { instructor: true, lessons: true },
        });
    }

    async remove(id: string) {
        return await this.prisma.course.delete({
            where: { id },
        });
    }
}