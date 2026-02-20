import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://g5-plearn.vercel.app',
    process.env.FRONTEND_URL, // Add environment variable for deployed frontend
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 4000);
  console.log(`🚀 Backend running on port ${process.env.PORT ?? 4000}`);

  // Log tất cả registered routes để debug
  const server = app.getHttpServer();
  const router = server._events.request._router;
  const routes = router.stack
    .filter(layer => layer.route)
    .map(layer => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).join(', ').toUpperCase()
    }));
  console.log('Registered Routes:', JSON.stringify(routes, null, 2));
}
bootstrap();