import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatDBModule } from './chat.db';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { REDIS_SERVICE } from '../utilits/redis.module';
import { JwtStrategy } from '../guards/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from '../guards/jwt.guard';
import { OwnerGuard } from '../guards/owner.guard';
import { RolesGuard } from '../guards/roles.guard';

const globalGuard = {
    provide: APP_GUARD,
    useClass: JwtGuard,
};

const ownerGuard = {
    provide: APP_GUARD,
    useClass: OwnerGuard,
};

const rolesGuard = {
    provide: APP_GUARD,
    useClass: RolesGuard,
};

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
        ChatDBModule,
        ConfigModule.forRoot(),
    ],
    controllers: [ChatController],
    providers: [ChatService, JwtStrategy, globalGuard, ownerGuard, rolesGuard],
})
export class ChatModule {}
