import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'debug'],
    });
    app.connectMicroservice({
        transport: Transport.REDIS,
        options: {
            port: 6379,
        },
    });

    await app.startAllMicroservices();
    await app.listen(3000);
}
bootstrap();
