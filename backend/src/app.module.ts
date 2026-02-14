import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { LessonsModule } from './lessons/lessons.module';
import { AiModule } from './ai/ai.module';  // ← Đã thêm dòng này

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CoursesModule,
    EnrollmentsModule,
    LessonsModule,
    AiModule,               // ← Xác nhận có dòng này
  ],
  providers: [PrismaService],
})
export class AppModule { }