import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './utilits/redis.module';
import { fixtureCreateUser } from './user/user.fixtures';
import { lastValueFrom, of } from 'rxjs';
import { Types } from 'mongoose';
import { HttpStatus } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './guards/jwt.guard';

const globalGuard = {
    provide: APP_GUARD,
    useClass: JwtGuard,
};

describe('AppController', () => {
    let appController: AppController;
    let appService: AppService;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [RedisModule],
            controllers: [AppController],
            providers: [AppService, globalGuard],
        }).compile();

        appController = app.get<AppController>(AppController);
        appService = app.get<AppService>(AppService);
    });

    describe('root', () => {
        it('should return "Hello World!"', () => {
            expect(appController.getHello()).toBe('Hello World!');
        });
    });

    it('create user', async () => {
        const createUserDto = fixtureCreateUser();
        const id = new Types.ObjectId(33333);
        const expectedUser = { ...createUserDto };

        jest.spyOn(appService, 'create').mockImplementation(async () =>
            of(expectedUser),
        );
        const result = await lastValueFrom(
            await appController.create(createUserDto),
        );
        console.log(result);
        console.log(expectedUser);
        expect(result).toEqual(expectedUser);
    });
});
