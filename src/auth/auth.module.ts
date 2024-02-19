import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { RedisModule } from '../utilits/redis.module';
import { MailService } from './mail.service';

@Module({
    imports: [ConfigModule.forRoot(), PassportModule, RedisModule],
    controllers: [AuthController],
    providers: [AuthService, JwtService, MailService],
})
export class AuthModule {}
