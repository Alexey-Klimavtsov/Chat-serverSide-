import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { RedisModule } from '../utilits/redis.module';
import { ChatDBModule } from './chat.db';
import { fixtureCreateChat } from './chat.fixtures';
import { HttpStatus } from '@nestjs/common';

describe('ChatController', () => {
    let controller: ChatController;
    let service: ChatService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RedisModule, ChatDBModule],
            controllers: [ChatController],
            providers: [ChatService],
        }).compile();

        controller = module.get<ChatController>(ChatController);
        service = module.get<ChatService>(ChatService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('create chat', async () => {
        const createChatDto = fixtureCreateChat();
        const result = 'room';
        jest.spyOn(service, 'create').mockImplementation(async () => result);
        expect(await controller.create(createChatDto)).toBe(result);
    });

    it('findAll', async () => {
        const result = ['room'];
        jest.spyOn(service, 'findAll').mockImplementation(async () => result);
        expect(await controller.findAll()).toBe(result);
    });

    it('findOne', async () => {
        const id = 'testid';
        const result = 'room';
        jest.spyOn(service, 'findOne').mockImplementation(async () => result);
        expect(await controller.findOne(id)).toBe(result);
    });

    it('update', async () => {
        const id = 'testid';
        const result = 'room';
        const createChatDto = fixtureCreateChat();

        jest.spyOn(service, 'update').mockImplementation(async () => result);
        expect(await controller.update({ ...createChatDto, id })).toBe(result);
    });

    it('remove', async () => {
        const id = 'testid';
        const result = HttpStatus.OK;
        jest.spyOn(service, 'remove').mockImplementation(async () => result);
        expect(await controller.remove(id)).toBe(result);
    });

    it('bun user', async () => {
        const userId = 'testId';
        const chatId = 'chatId';
        const result = HttpStatus.OK;
        jest.spyOn(service, 'banUser').mockImplementation(async () => result);
        expect(await controller.banUser(chatId, userId)).toBe(result);
    });
});
