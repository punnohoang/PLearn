import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from '../common/dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateEnrollmentDto, userId: string) {
    try {
      return await this.prisma.enrollment.create({
        data: { ...dto, userId },
        include: { course: { include: { instructor: true } } },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Bạn đã đăng ký khóa học này rồi.');
      }
      throw error;
    }
  }

  async findByUser(userId: string) {
    return await this.prisma.enrollment.findMany({
      where: { userId },
      include: { course: { include: { instructor: true, lessons: true } } },
    });
  }

  async findOne(id: string) {
    return await this.prisma.enrollment.findUnique({
      where: { id },
      include: { course: { include: { instructor: true, lessons: true } } },
    });
  }

  async updateProgress(id: string, progress: number) {
    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress phải từ 0 đến 100.');
    }
    return await this.prisma.enrollment.update({
      where: { id },
      data: { progress },
    });
  }

  async remove(id: string) {
    return await this.prisma.enrollment.delete({
      where: { id },
    });
  }
}