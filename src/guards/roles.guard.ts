import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Inject,
    Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable, lastValueFrom } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enum/roles.enum';
import { CreateRestApiTokenDto } from '../auth/dto/createToken-auth.dto';
import { REDIS_SERVICE } from '../utilits/redis.module';
import { ClientProxy } from '@nestjs/microservices';
import { ERROR, MESSAGE } from '../utilits/constants';
import { ChatDocument } from '../chat/schemas/chat.schema';

const CHAT_FIELD = {
    [Role.Admin]: 'admins',
    [Role.User]: 'users',
};

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        @Inject(REDIS_SERVICE) private redisClient: ClientProxy,
        private reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles?.length) return true;

        const user: CreateRestApiTokenDto = request.user;
        const chatId = request.params.chatId;

        const chatObservable = this.redisClient.send(
            MESSAGE.GET_CHAT_BY_ID,
            chatId,
        );
        const chat = await lastValueFrom(chatObservable);

        for (const role of requiredRoles) {
            if ((chat[CHAT_FIELD[role]] as string[]).includes(user._id)) {
                return true;
            }
        }

        if (chat.createdBy === user._id) return true;

        throw new ForbiddenException(ERROR.ACCESS_DENIED);
    }
}
