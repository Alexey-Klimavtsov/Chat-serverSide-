import { Module } from '@nestjs/common';
import { PollingService } from './polling.service';
import { PollingController } from './polling.controller';
import { RedisModule } from '../utilits/redis.module';
import { PollingGateway } from './polling.gateway';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [RedisModule, JwtModule, ConfigModule.forRoot()],
    controllers: [PollingController],
    providers: [PollingService, PollingGateway, JwtService, ConfigService],
})
export class PollingModule {}
