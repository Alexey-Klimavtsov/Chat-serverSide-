import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { fixtureCreateChat } from './chat.fixtures';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatDocument } from './schemas/chat.schema';
import { RedisModule } from '../utilits/redis.module';
import { ChatDBModule } from './chat.db';
import { UpdateChatDto } from './dto/update-chat.dto';
import { HttpStatus, Logger } from '@nestjs/common';

describe('ChatService', () => {
    let service: ChatService;
    const createChatDto: CreateChatDto = fixtureCreateChat();
    let createdChat: ChatDocument;
    let chatId: string;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RedisModule, ChatDBModule],
            providers: [ChatService, Logger],
        }).compile();

        service = module.get<ChatService>(ChatService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('create chat', async () => {
        createdChat = await service.create(createChatDto);
        chatId = createdChat._id.toString();
        expect(createdChat.name).toBe(createChatDto.name);
    });

    it('get all chat', async () => {
        const allChats = await service.findAll();
        expect(allChats.length).toBeGreaterThan(0);
    });

    it('get chat by id', async () => {
        const chatById = await service.findOne(chatId);
        expect(chatById?.name).toEqual(createChatDto.name);
    });

    it('update chat by id', async () => {
        const updateChatDto: UpdateChatDto = {
            id: chatId,
            name: 'room_chat',
        };
        const updatedChat: ChatDocument = await service.update(
            chatId,
            updateChatDto,
        );
        expect(updatedChat?.name).toEqual(updateChatDto.name);
    });

    it('ban user', async () => {
        const userId = 'testId2';
        const updatedChat: ChatDocument = await service.banUser(chatId, userId);
        expect(updatedChat?.bannedUsers?.includes(userId)).toBe(true);
    });

    it('remove user from bun', async () => {
        const userId = 'testId2';
        const updatedChat: ChatDocument = await service.removeUserFromBan(
            chatId,
            userId,
        );
        expect(updatedChat?.bannedUsers?.includes(userId)).toBe(false);
    });

    it('delete chat by id', async () => {
        const status = await service.remove(createdChat._id.toString());
        expect(status).toEqual(HttpStatus.OK);
    });
});
