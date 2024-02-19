import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { REDIS_SERVICE } from './utilits/redis.module';
import { CreateUserDto } from './user/dto/create-user.dto';
import { CreateMessageDto } from './message/dto/create-message.dto';
import { CreateRestApiTokenDto } from './auth/dto/createToken-auth.dto';
import { UserDocument } from './user/schemas/user.schema';
import { EVENT, MESSAGE } from './utilits/constants';

@Injectable()
export class AppService {
    constructor(@Inject(REDIS_SERVICE) private redisClient: ClientProxy) {}
    getHello(): string {
        return 'Hello World!';
    }

    async getUserById(id: string) {
        return this.redisClient.send(MESSAGE.GET_USER_BY_ID, id);
    }

    async create(createUserDto: CreateUserDto) {
        return this.redisClient.send(MESSAGE.CREATE_USER, createUserDto);
    }

    async createToken(createTokenDto: CreateRestApiTokenDto) {
        return this.redisClient.send('createToken', createTokenDto);
    }

    async sendInvite(createTokenDto: CreateRestApiTokenDto) {
        this.redisClient.emit('sendInvite', createTokenDto);
    }
}
