import { Controller, Get, Post } from '@nestjs/common';  // Thêm Post
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }

  @Post('test')  // ← Thêm route test POST
  testPost() {
    return { message: 'POST test successful!' };
  }
}