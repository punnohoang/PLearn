import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from '../common/dto/create-lesson.dto';

@Injectable()
export class LessonsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateLessonDto, courseId: string) {
        return await this.prisma.lesson.create({
            data: { ...dto, courseId },
            include: { course: true },
        });
    }

    async findByCourse(courseId: string) {
        return await this.prisma.lesson.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
        });
    }

    async findOne(id: string) {
        return await this.prisma.lesson.findUnique({
            where: { id },
            include: { course: true },
        });
    }

    async update(id: string, dto: CreateLessonDto) {
        return await this.prisma.lesson.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        return await this.prisma.lesson.delete({
            where: { id },
        });
    }
}