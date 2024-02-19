import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { ClientProxy } from '@nestjs/microservices';
import { REDIS_SERVICE } from '../utilits/redis.module';
import { Seen } from '../polling/polling.gateway';
import { EVENT } from '../utilits/constants';

@Injectable()
export class MessageService {
    private messageModel;

    constructor(
        @Inject(REDIS_SERVICE) private redisClient: ClientProxy,
        @InjectConnection('message') private connection: Connection,
    ) {
        this.messageModel = this.connection.model(Message.name);
    }

    async create(createMessageDto: CreateMessageDto) {
        const createdMessage: MessageDocument =
            await this.messageModel.create(createMessageDto);

        if (createdMessage.scheduled && createdMessage.scheduled > new Date()) {
            this.sendEvent(EVENT.MESSAGE_SCHEDULED, createdMessage);
            return;
        }
        this.sendEvent(EVENT.MESSAGE_SAVED, createdMessage);
    }

    async sendEvent(event: string, data: unknown) {
        return this.redisClient.emit(event, data);
    }

    async findAll() {
        return this.messageModel.find({});
    }

    async findOne(id: string) {
        return this.messageModel.findById(id);
    }

    async update(id: string, updateMessage: UpdateMessageDto) {
        return await this.messageModel.findByIdAndUpdate(id, updateMessage, {
            new: true,
        });
    }

    async markMessageAsRead(id: string) {
        return await this.messageModel.findByIdAndUpdate(
            id,
            { seenAt: new Date() },
            {
                new: true,
            },
        );
    }

    async remove(id: string) {
        await this.messageModel.findByIdAndDelete(id);
        return HttpStatus.OK;
    }

    async softRemove(id: string) {
        const updateMessageDto = { isDeleted: true, deletedAt: new Date() };
        await this.messageModel.findByIdAndUpdate(id, updateMessageDto);
        return HttpStatus.OK;
    }

    async cancelRemove(id: string) {
        const updateMessageDto = { isDeleted: false, deletedAt: null };
        await this.messageModel.findByIdAndUpdate(id, updateMessageDto);
        return HttpStatus.OK;
    }

    async getHistory(messageHistoryDays = 0) {
        const dateToday = new Date();
        const startDate = dateToday.setDate(
            dateToday.getDate() - messageHistoryDays,
        );
        return this.messageModel
            .find()
            .where('createdAt')
            .gte(startDate)
            .where({ isDeleted: false });
    }
}
