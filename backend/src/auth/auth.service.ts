import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        try {
            // Check if email already exists
            const existingUser = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existingUser) {
                throw new BadRequestException('Email đã được sử dụng. Vui lòng sử dụng email khác.');
            }

            const hashed = await bcrypt.hash(dto.password, 10);
            const user = await this.prisma.user.create({
                data: { ...dto, password: hashed },
            });
            return this.login({ email: user.email, password: dto.password });
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new BadRequestException('Email đã được sử dụng. Vui lòng sử dụng email khác.');
            }
            throw error;
        }
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        return { access_token: this.jwtService.sign(payload) };
    }

    async validateUser(payload: any) {
        return this.prisma.user.findUnique({ where: { id: payload.sub } });
    }
}