import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreatePollingDto } from './dto/create-polling.dto';
import { UpdatePollingDto } from './dto/update-polling.dto';
import { CreateMessageDto } from '../message/dto/create-message.dto';
import { REDIS_SERVICE } from '../utilits/redis.module';
import { ClientProxy } from '@nestjs/microservices';
import { AuthSocket, PollingGateway, Seen } from './polling.gateway';
import { Server } from 'socket.io';
import { Subject, lastValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EVENT } from '../utilits/constants';
import { UpdateMessageDto } from '../message/dto/update-message.dto';
import * as schedule from 'node-schedule';
import { Socket } from 'socket.io-client';
import { MessageDocument } from '../message/schemas/message.schema';

const activeConnections: AuthSocket[] = [];

@Injectable()
export class PollingService {
    private gatewayEvents = new Subject<{ event: string; data: unknown }>();
    private job: Record<string, unknown>;

    constructor(
        @Inject(REDIS_SERVICE) private redisClient: ClientProxy,
        private configService: ConfigService,
        private jwtService: JwtService,
    ) {}

    async handleMessage(createMessageDto: CreateMessageDto) {
        this.redisClient.emit(EVENT.CHAT_MESSAGE_APPROVED, createMessageDto);
    }

    async updateMessage(messageUpdate: UpdateMessageDto) {
        this.redisClient.emit('updateMessage', messageUpdate);
    }

    async markMessageAsRead(messageUpdate: Seen) {
        this.redisClient.emit(EVENT.MESSAGE_READED, messageUpdate);
    }

    async sendMessage(
        createMessageDto: CreateMessageDto,
        event = EVENT.SOCKET_MESSAGE,
    ) {
        this.gatewayEvents.next({
            event,
            data: createMessageDto,
        });
    }

    getEvents() {
        return this.gatewayEvents;
    }

    async handleConnection(token: string, isSocketSecretKeyValid = false) {
        const keyName = isSocketSecretKeyValid ? 'JWT_SOCKET' : 'JWT_REST';
        const secret = this.configService.get(keyName);
        const payload = await this.jwtService.verify(token, { secret });
        return payload;
    }

    async sendMessageToRedis(event: string, data: unknown) {
        return this.redisClient.send(event, data);
    }

    connectToChat(userId: string, chatId: string) {
        const client = activeConnections.find(
            (client) => client.user._id === userId,
        );
        client?.join(chatId);
        client
            ?.to(chatId)
            .emit(
                EVENT.SOCKET_MESSAGE,
                `Welcome ${client.user.username} to our chat`,
            );
    }

    disconnectFromChat(userId: string, chatId: string) {
        const client = activeConnections.find(
            (client) => client.user._id === userId,
        );
        client
            ?.to(chatId)
            .emit(
                EVENT.SOCKET_MESSAGE,
                `${client.user.username} leave our chat`,
            );
        client?.leave(chatId);
    }

    addActiveConnection(client: AuthSocket) {
        activeConnections.push(client);
    }

    removeActiveConnection(client: AuthSocket) {
        const clientIndex = activeConnections.findIndex(
            (elem) => elem.id === client.id,
        );
        activeConnections.splice(clientIndex, 1);
    }

    async scheduleMessage(message: MessageDocument) {
        const messageId = message._id.toString();
        this.job[messageId] = schedule.scheduleJob(
            message.scheduled as Date,
            async () => {
                this.sendMessage(message);
            },
        );
    }
}
