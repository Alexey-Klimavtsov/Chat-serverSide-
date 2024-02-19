import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from '../message/dto/create-message.dto';
import { PollingService } from './polling.service';
import {
    CreateSoketTokenDto,
    CreateRestApiTokenDto,
} from '../auth/dto/createToken-auth.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { ERROR, EVENT, MESSAGE } from '../utilits/constants';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { REDIS_SERVICE } from '../utilits/redis.module';
import { UpdateMessageDto } from 'src/message/dto/update-message.dto';
import { ChatDocument } from '../chat/schemas/chat.schema';

export interface AuthSocket extends Socket {
    user: CreateSoketTokenDto & { bannedChatIds: string[] };
}

export type Seen = {
    chatId: string;
    messageId: string;
};
@WebSocketGateway()
export class PollingGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    constructor(
        @Inject(REDIS_SERVICE) private redisClient: ClientProxy,
        private readonly pollingService: PollingService,
    ) {}

    @WebSocketServer() server: Server;

    afterInit(server: Server) {
        console.log('WebSocket Gateway initialized');
        this.pollingService.getEvents().subscribe({
            next: ({ event, data }) => {
                this.sendToClients(
                    data as CreateMessageDto | UpdateMessageDto,
                    event,
                );
            },
        });
    }

    async handleConnection(client: AuthSocket) {
        console.log(`Client connected: ${client.id}`);

        const isSocketSecretKeyValid = true;
        const token = client.handshake.auth.token;
        try {
            const user = (await this.pollingService.handleConnection(
                token,
                isSocketSecretKeyValid,
            )) as CreateSoketTokenDto & { bannedChatIds: string[] };

            const chatsObservable = this.pollingService.sendMessageToRedis(
                MESSAGE.GET_USER_CHATS,
                user._id,
            );
            const chats = (await lastValueFrom(
                await chatsObservable,
            )) as ChatDocument[];

            user.chatIds = chats.map((chat) => chat._id.toString());
            user.bannedChatIds = chats
                .filter((chat) => chat?.bannedUsers?.includes(user._id))
                .map((chat) => chat._id.toString());

            client['user'] = user;

            client.join(user._id);

            this.pollingService.addActiveConnection(client);

            if (user.chatIds?.length > 0) {
                user.chatIds.forEach((chatId) => {
                    this.pollingService.connectToChat(user._id, chatId);
                });
            }
        } catch (error) {
            console.error(error.message);
            client.disconnect(true);
        }
    }

    handleDisconnect(client: AuthSocket) {
        this.pollingService.removeActiveConnection(client);
        console.log(`Client desconnected: ${client.id}`);
    }

    sendToClients(msg: CreateMessageDto | UpdateMessageDto, event: string) {
        this.server.to(msg.chatId).emit(event, msg);
    }

    sendToClient(userId: string, msg: CreateMessageDto) {
        this.server.to(userId).emit(EVENT.SOCKET_MESSAGE, msg);
    }

    @SubscribeMessage(EVENT.SOCKET_MESSAGE)
    handleMessage(
        @ConnectedSocket() client: AuthSocket,
        @MessageBody() message: CreateMessageDto,
    ): void {
        if (!client.user.chatIds?.includes(message.chatId)) {
            throw new NotFoundException(ERROR.ACCESS_DENIED);
        }
        if (client.user?.bannedChatIds?.includes(message.chatId)) {
            throw new NotFoundException(ERROR.BANNED);
        }
        this.pollingService.handleMessage(message);
    }

    @SubscribeMessage('ping')
    handlePing(@ConnectedSocket() client: AuthSocket) {
        return {
            event: 'pong',
            data: 'pong data',
        };
    }

    @SubscribeMessage(EVENT.SEEN)
    handleSeen(@MessageBody() data: Seen) {
        this.pollingService.markMessageAsRead(data);
    }
}
