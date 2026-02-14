import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from '../common/dto/create-lesson.dto';

@Injectable()
export class LessonsService {
    constructor(private prisma: PrismaService) { }

    create(dto: CreateLessonDto, courseId: string) {
        return this.prisma.lesson.create({
            data: { ...dto, courseId },
        });
    }

    findByCourse(courseId: string) {
        return this.prisma.lesson.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
        });
    }
}