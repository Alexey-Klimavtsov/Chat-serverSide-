import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageDBModule } from './message.db';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../utilits/redis.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from '../guards/jwt.guard';
import { OwnerGuard } from '../guards/owner.guard';
import { MessageSchema } from './schemas/message.schema';

const globalGuard = {
    provide: APP_GUARD,
    useClass: JwtGuard,
};

const ownerGuard = {
    provide: APP_GUARD,
    useClass: OwnerGuard,
};

const expiryTime = 30 * 24 * 60 * 60;

@Module({
    imports: [MessageDBModule, RedisModule],
    controllers: [MessageController],
    providers: [MessageService, globalGuard, ownerGuard],
})
export class MessageModule {
    constructor() {
        MessageSchema.index(
            { deletedAt: 1 },
            { expireAfterSeconds: expiryTime },
        );
    }
}
