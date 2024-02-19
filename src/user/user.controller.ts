import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './schemas/user.schema';
import { EVENT, MESSAGE } from '../utilits/constants';
import { OwnerGuard } from '../guards/owner.guard';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @MessagePattern(MESSAGE.CREATE_USER)
    async create(@Payload() createUserDto: CreateUserDto): Promise<void> {
        const user = await this.userService.create(createUserDto);
        this.userService.sendEvent(EVENT.USER_CREATED, user);
        return user;
    }

    @MessagePattern('findAllUser')
    findAll() {
        return this.userService.findAll();
    }

    @MessagePattern(MESSAGE.GET_USER_BY_ID)
    findOne(@Payload() id: string) {
        return this.userService.findOne(id);
    }

    @MessagePattern('updateUser')
    update(@Payload() updateUserDto: UpdateUserDto) {
        return this.userService.update(updateUserDto.id, updateUserDto);
    }

    @MessagePattern('removeUser')
    remove(@Payload() id: string) {
        return this.userService.remove(id);
    }
}
