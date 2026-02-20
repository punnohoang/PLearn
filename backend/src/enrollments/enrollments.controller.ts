import { Controller, Post, Get, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
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
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.enrollmentsService.updateProgress(id, body.progress);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.enrollmentsService.remove(id);
    }
}