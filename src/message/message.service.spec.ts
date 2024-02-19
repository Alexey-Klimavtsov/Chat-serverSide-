import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { fixtureCreateMessage } from './message.fixtures';
import { MessageDocument } from './schemas/message.schema';
import { RedisModule } from '../utilits/redis.module';
import { MessageDBModule } from './message.db';
import { UpdateMessageDto } from './dto/update-message.dto';
import { HttpStatus } from '@nestjs/common';

describe('MessageService', () => {
    let service: MessageService;
    const createMessageDto = fixtureCreateMessage();
    let createdMessage: MessageDocument;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RedisModule, MessageDBModule],
            providers: [MessageService],
        }).compile();

        service = module.get<MessageService>(MessageService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('create message', async () => {
        createdMessage = await service.create(createMessageDto);
        expect(createdMessage.text).toBe(createMessageDto.text);
    });

    it('get all message', async () => {
        const allMessages = await service.findAll();
        expect(allMessages.length).toBeGreaterThan(0);
    });

    it('get message by id', async () => {
        const messageById: MessageDocument = await service.findOne(
            createdMessage._id.toString(),
        );
        expect(messageById?.text).toEqual(createMessageDto.text);
    });

    // it('update message by id', async () => {
    //     const updateMessageDto: UpdateMessageDto = {
    //         id: createdMessage._id.toString(),
    //         text: 'By, by!',
    //     };
    //     const updatedMessage: MessageDocument = await service.update(
    //         createdMessage._id.toString(),
    //         updateMessageDto,
    //     );
    //     expect(updatedMessage?.text).toEqual(updateMessageDto.text);
    // });

    it('delete message by id', async () => {
        const status = await service.remove(createdMessage._id.toString());
        expect(status).toEqual(HttpStatus.OK);
    });

    it.only('get message by date', async () => {
        const messages = await service.getHistory(10);
        expect(Array.isArray(messages)).toBe(true);
    });
});
