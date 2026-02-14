import { Controller, Post, Get, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from '../common/dto/create-enrollment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('enrollments')
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateEnrollmentDto, @Req() req: any) {
        return this.enrollmentsService.create(dto, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findByUser(@Req() req: any) {
        return this.enrollmentsService.findByUser(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/progress')
    updateProgress(@Param('id') id: string, @Body('progress') progress: number) {
        return this.enrollmentsService.updateProgress(id, progress);
    }
}