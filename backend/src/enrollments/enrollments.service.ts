import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from '../common/dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) { }

  create(dto: CreateEnrollmentDto, userId: string) {
    return this.prisma.enrollment.create({
      data: { ...dto, userId },
      include: { course: true },
    });
  }

  findByUser(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
    });
  }

  updateProgress(id: string, progress: number) {
    return this.prisma.enrollment.update({
      where: { id },
      data: { progress },
    });
  }
}