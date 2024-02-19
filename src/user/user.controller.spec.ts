import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RedisModule } from '../utilits/redis.module';
import { UserDBModule } from './user.db';
import { fixtureCreateUser } from './user.fixtures';
import { HttpStatus } from '@nestjs/common';

describe('UserController', () => {
    let controller: UserController;
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RedisModule, UserDBModule],
            controllers: [UserController],
            providers: [UserService],
        }).compile();

        controller = module.get<UserController>(UserController);
        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('create user', async () => {
        const createUserDto = fixtureCreateUser();
        const result = 'user';
        jest.spyOn(service, 'create').mockImplementation(async () => result);
        jest.spyOn(service, 'sendEvent').mockImplementation(
            async () => undefined,
        );
        expect(await controller.create(createUserDto)).toBe(result);
    });

    it('findAll', async () => {
        const result = ['user'];
        jest.spyOn(service, 'findAll').mockImplementation(async () => result);
        expect(await controller.findAll()).toBe(result);
    });

    it('findOne', async () => {
        const id = 'testid';
        const result = 'user';
        jest.spyOn(service, 'findOne').mockImplementation(async () => result);
        expect(await controller.findOne(id)).toBe(result);
    });

    it('update', async () => {
        const id = 'testid';
        const result = 'user';
        const createUserDto = fixtureCreateUser();

        jest.spyOn(service, 'update').mockImplementation(async () => result);
        expect(await controller.update({ ...createUserDto, id })).toBe(result);
    });

    it('remove', async () => {
        const id = 'testid';
        const result = HttpStatus.OK;
        jest.spyOn(service, 'remove').mockImplementation(async () => result);
        expect(await controller.remove(id)).toBe(result);
    });
});
