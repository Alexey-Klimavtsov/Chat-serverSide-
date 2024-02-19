import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { User } from './schemas/user.schema';
import { REDIS_SERVICE } from '../utilits/redis.module';
import { EVENT } from '../utilits/constants';

@Injectable()
export class UserService {
    private userModel;
    constructor(
        @Inject(REDIS_SERVICE) private redisClient: ClientProxy,
        @InjectConnection('user') private connection: Connection,
    ) {
        this.userModel = this.connection.model(User.name);
    }

    async create(createUserDto: CreateUserDto) {
        const createdUser = await this.userModel.create(createUserDto);
        return createdUser;
    }

    async findAll() {
        return this.userModel.find({});
    }

    async findOne(id: string) {
        return this.userModel.findById(id);
    }

    async update(id: string | number, updateUserDto: UpdateUserDto) {
        return await this.userModel.findByIdAndUpdate(id, updateUserDto, {
            new: true,
        });
    }

    async remove(id: string) {
        await this.userModel.findByIdAndDelete(id);
        return HttpStatus.OK;
    }

    sendEvent(event: string, data: Record<string, unknown>) {
        this.redisClient.emit(event, data);
    }
}
