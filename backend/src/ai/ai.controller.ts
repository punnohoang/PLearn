import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
export class AiController {
    constructor(private aiService: AiService) { }

    @UseGuards(JwtAuthGuard)
    @Post('ask')
    async ask(@Body() body: { question: string; context: string }) {
        return this.aiService.askQuestion(body.question, body.context);
    }
}