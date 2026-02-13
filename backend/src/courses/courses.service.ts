import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from '../common/dto/create-course.dto';

@Injectable()
export class CoursesService {
    constructor(private prisma: PrismaService) { }

    create(dto: CreateCourseDto, instructorId: string) {
        return this.prisma.course.create({
            data: { ...dto, instructorId },
        });
    }

    findAll() {
        return this.prisma.course.findMany({ include: { instructor: true } });
    }

    findOne(id: string) {
        return this.prisma.course.findUnique({ where: { id }, include: { instructor: true } });
    }

    update(id: string, dto: CreateCourseDto) {
        return this.prisma.course.update({ where: { id }, data: dto });
    }

    remove(id: string) {
        return this.prisma.course.delete({ where: { id } });
    }
}