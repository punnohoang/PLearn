import { Controller, Post, Get, Body, Param, UseGuards, Patch, Delete } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from '../common/dto/create-lesson.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) { }

    @UseGuards(JwtAuthGuard)
    @Post(':courseId')
    create(@Param('courseId') courseId: string, @Body() dto: CreateLessonDto) {
        return this.lessonsService.create(dto, courseId);
    }

    @Get(':courseId')
    findByCourse(@Param('courseId') courseId: string) {
        return this.lessonsService.findByCourse(courseId);
    }

    @Get('detail/:id')
    findOne(@Param('id') id: string) {
        return this.lessonsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: CreateLessonDto) {
        return this.lessonsService.update(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/video')
    uploadVideo(
        @Param('id') id: string,
        @Body() { videoUrl }: { videoUrl: string }
    ) {
        return this.lessonsService.updateVideo(id, videoUrl);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.lessonsService.remove(id);
    }
}