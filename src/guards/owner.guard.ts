import {
    Injectable,
    CanActivate,
    ExecutionContext,
    Inject,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IncomingHttpHeaders } from 'http';
import { CreateRestApiTokenDto } from '../auth/dto/createToken-auth.dto';
import { REDIS_SERVICE } from '../utilits/redis.module';
import { ClientProxy } from '@nestjs/microservices';
import { ERROR, MESSAGE } from '../utilits/constants';
import { Observable, lastValueFrom } from 'rxjs';
import { ChatDocument } from '../chat/schemas/chat.schema';
import { Resource } from '../enum/resource.enum';
import { RESOURCE_KEY } from '../decorators/owner.decorator';
import { MessageDocument } from '../message/schemas/message.schema';

Injectable();
export class OwnerGuard implements CanActivate {
    private readonly logger = new Logger(OwnerGuard.name);

    constructor(
        @Inject(REDIS_SERVICE) private redisClient: ClientProxy,
        private reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.debug('OwnerGuard');

        const request = context.switchToHttp().getRequest();
        const resourceName = this.reflector.getAllAndOverride<Resource>(
            RESOURCE_KEY,
            [context.getHandler(), context.getClass()],
        );

        const user: CreateRestApiTokenDto = request.user;
        const resourceId = request.params.id;

        if (!resourceName) return true;

        switch (resourceName) {
            case Resource.Chat:
                if (await this.isChatOwner(user, resourceId)) return true;
                throw new ForbiddenException(ERROR.ACCESS_DENIED);

            case Resource.Message:
                const messageObservable = this.redisClient.send(
                    MESSAGE.GET_MESSAGE_BY_ID,
                    resourceId,
                );
                const message: MessageDocument = await lastValueFrom(
                    await messageObservable,
                );
                if (message.createdBy === user._id) return true;
                if (await this.isChatOwner(user, message.chatId)) return true;
                throw new ForbiddenException(ERROR.ACCESS_DENIED);

            default:
                throw new ForbiddenException(ERROR.ACCESS_DENIED);
        }
    }

    async isChatOwner(user: CreateRestApiTokenDto, chatId: string) {
        const chatObservable = this.redisClient.send(
            MESSAGE.GET_CHAT_BY_ID,
            chatId,
        );
        const chat: ChatDocument = await lastValueFrom(chatObservable);
        return chat.createdBy === user._id;
    }
}
