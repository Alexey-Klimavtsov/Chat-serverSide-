import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserDBModule } from './user.db';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS_SERVICE } from '../utilits/redis.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from '../guards/jwt.guard';

// const globalGuard = {
//     provide: APP_GUARD,
//     useClass: JwtGuard,
// };

@Module({
    imports: [
        ClientsModule.register([
            {
                name: REDIS_SERVICE,
                transport: Transport.REDIS,
                options: {
                    host: 'localhost',
                    port: 6379,
                },
            },
        ]),

        UserDBModule,
    ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
