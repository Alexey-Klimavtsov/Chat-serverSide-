import { Injectable, Inject, HttpStatus, Logger } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { ClientProxy } from '@nestjs/microservices';
import { REDIS_SERVICE } from '../utilits/redis.module';
import { EVENT, MESSAGE } from '../utilits/constants';

@Injectable()
export class ChatService {
    private chatModel;
    private readonly logger = new Logger(ChatService.name);

    constructor(
        @Inject(REDIS_SERVICE) private redisClient: ClientProxy,
        @InjectConnection('chat') private connection: Connection,
    ) {
        this.chatModel = this.connection.model<ChatDocument>(Chat.name);
    }

    async create(createChatDto: CreateChatDto) {
        return await this.chatModel.create(createChatDto);
    }

    async findAll() {
        return this.chatModel.find({});
    }

    async findOne(id: string) {
        return this.chatModel.findById(id);
    }

    async update(id: string | number, updateChatDto: UpdateChatDto) {
        return await this.chatModel.findByIdAndUpdate(id, updateChatDto, {
            new: true,
        });
    }

    async remove(id: string) {
        await this.chatModel.findByIdAndDelete(id);
        return HttpStatus.OK;
    }

    async getChatsByUserId(userId: string) {
        return this.chatModel.find({ users: { $in: [userId] } });
    }

    async addUsersToChat({ id, users }: UpdateChatDto) {
        await this.chatModel.updateOne(
            { _id: id },
            { $addToSet: { users: { $each: users } } },
        );
        this.redisClient.emit(EVENT.USERS_ADDED_TO_CHAT, { chatId: id, users });
        return HttpStatus.OK;
    }

    async removeUsersFromChat({ id, users }: UpdateChatDto) {
        await this.chatModel.updateOne(
            { _id: id },
            { $pull: { users: { $in: users } } },
        );
        this.redisClient.emit(EVENT.USERS_REMOVED_FROM_CHAT, {
            chatId: id,
            users,
        });
        return HttpStatus.OK;
    }

    async addAdminsToChat(chatId: string, { admins }: UpdateChatDto) {
        await this.chatModel.updateOne(
            { _id: chatId },
            { $addToSet: { admins: { $each: admins } } },
        );
    }

    async removeAdminsFromChat(chatId: string, { admins }: UpdateChatDto) {
        await this.chatModel.updateOne(
            { _id: chatId },
            { $pull: { admins: { $in: admins } } },
        );
    }

    async sendMessage(id: string) {
        return this.redisClient.send(MESSAGE.REMOVE_MESSAGE_SOFT, id);
    }

    async banUser(chatId: string, bannedUserId: string) {
        this.logger.log('bun user by Id');
        const updatedChat = await this.chatModel.findByIdAndUpdate(
            chatId,
            {
                $addToSet: { bannedUsers: bannedUserId },
            },
            { new: true },
        );
        return updatedChat;
    }

    async removeUserFromBan(chatId: string, userId: string) {
        this.logger.debug('unban user by Id');
        const updatedChat = await this.chatModel.findByIdAndUpdate(
            chatId,
            {
                $pull: { bannedUsers: userId },
            },
            { new: true },
        );
        return updatedChat;
    }
}
