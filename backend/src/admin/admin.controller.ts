import { Controller, Get, Put, Delete, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
    constructor(private prisma: PrismaService) {}

    @Get('users')
    @Roles('ADMIN', 'MANAGER', 'HR')
    async getAllUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        courses: true,
                        enrollments: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    @Get('users/:id')
    @Roles('ADMIN', 'MANAGER', 'HR')
    async getUserDetail(@Param('id') id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                enrollments: {
                    select: {
                        id: true,
                        course: true,
                        progress: true,
                        enrolledAt: true,
                    },
                },
            },
        });
    }

    @Put('users/:id/role')
    @Roles('ADMIN')
    async updateUserRole(@Param('id') id: string, @Body() { role }: { role: string }) {
        // Validate that the role is a valid Role enum value
        if (!Object.values(Role).includes(role as Role)) {
            throw new BadRequestException(`Invalid role: ${role}. Valid roles are: ${Object.values(Role).join(', ')}`);
        }

        return this.prisma.user.update({
            where: { id },
            data: { role: role as Role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
    }

    @Delete('users/:id')
    @Roles('ADMIN')
    async deleteUser(@Param('id') id: string) {
        // Delete related data first
        await this.prisma.enrollment.deleteMany({ where: { userId: id } });
        
        return this.prisma.user.delete({
            where: { id },
        });
    }

    @Get('statistics')
    @Roles('ADMIN', 'MANAGER', 'HR')
    async getStatistics() {
        const totalUsers = await this.prisma.user.count();
        const totalCourses = await this.prisma.course.count();
        const totalEnrollments = await this.prisma.enrollment.count();
        const usersByRole = await this.prisma.user.groupBy({
            by: ['role'],
            _count: { id: true },
        });

        return {
            totalUsers,
            totalCourses,
            totalEnrollments,
            usersByRole,
        };
    }

    @Get('courses-stats')
    @Roles('ADMIN', 'MANAGER')
    async getCoursesStatistics() {
        return this.prisma.course.findMany({
            select: {
                id: true,
                title: true,
                instructor: {
                    select: { name: true, email: true },
                },
                _count: {
                    select: {
                        enrollments: true,
                        lessons: true,
                    },
                },
            },
        });
    }
}
