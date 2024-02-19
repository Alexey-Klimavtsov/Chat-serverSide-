import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { RedisModule } from '../utilits/redis.module';
import { MessageDBModule } from './message.db';
import { fixtureCreateMessage } from './message.fixtures';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MessageModule } from './message.module';

describe('MessageController', () => {
    let controller: MessageController;
    let service: MessageService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RedisModule, MessageDBModule],
            controllers: [MessageController],
            providers: [MessageService],
        }).compile();

        controller = module.get<MessageController>(MessageController);
        service = module.get<MessageService>(MessageService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('create message', async () => {
        const createMessageDto = fixtureCreateMessage();
        jest.spyOn(service, 'create').mockImplementation(async () => undefined);
        expect(await controller.create(createMessageDto)).toBe(HttpStatus.OK);
    });

    it('findAll', async () => {
        const result = ['Hellow!'];
        jest.spyOn(service, 'findAll').mockImplementation(async () => result);
        expect(await controller.findAll()).toBe(result);
    });

    it('findOne', async () => {
        const id = 'testid';
        const result = 'Hellow!';
        jest.spyOn(service, 'findOne').mockImplementation(async () => result);
        expect(await controller.findOne(id)).toBe(result);
    });

    it('update', async () => {
        const id = 'testid';
        const result = 'Hellow!';
        const createMessageDto = fixtureCreateMessage();

        jest.spyOn(service, 'update').mockImplementation(async () => result);
        expect(await controller.update({ ...createMessageDto, id })).toBe(
            result,
        );
    });

    it('remove', async () => {
        const id = 'testid';
        const result = HttpStatus.OK;
        jest.spyOn(service, 'softRemove').mockImplementation(
            async () => result,
        );
        expect(await controller.remove(id)).toBe(result);
    });
});

// describe.skip('MessageController (test guards)', () => {
//     let app: INestApplication;

//     beforeAll(async () => {
//         const moduleFixture: TestingModule = await Test.createTestingModule({
//             imports: [MessageModule],
//         }).compile();

//         app = moduleFixture.createNestApplication();
//         await app.init();
//     });

//     afterAll(async () => {
//         await app.close();
//     });
// });
