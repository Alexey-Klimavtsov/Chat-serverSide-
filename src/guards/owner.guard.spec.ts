import { Test } from '@nestjs/testing';
import { OwnerGuard } from './owner.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Resource } from '../enum/resource.enum';
import { MessageDocument } from '../message/schemas/message.schema';
import { getMockContext } from './fixtures.guard';

describe('Owner Guard', () => {
    let ownerGuard: OwnerGuard;

    const userId = 'userId';
    const messageId = 'messageId';
    const request = {
        user: { _id: userId },
        params: { id: messageId },
    };

    const mockReflector = {
        getAllAndOverride: jest.fn(),
    };

    let redisSendResult: Partial<MessageDocument>;
    const redisClient = {
        send: () => ({
            subscribe: (observer: any) => {
                observer.next(redisSendResult);
                observer.complete();
            },
        }),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                OwnerGuard,
                { provide: Reflector, useValue: mockReflector },
                { provide: 'REDIS_SERVICE', useValue: redisClient },
            ],
        }).compile();

        ownerGuard = moduleRef.get<OwnerGuard>(OwnerGuard);
    });

    it('should be defined', () => {
        expect(ownerGuard).toBeDefined();
    });

    it('should return true if resouce name is not specified', async () => {
        const mockContext: ExecutionContext = getMockContext(request);
        mockReflector.getAllAndOverride.mockReturnValueOnce(undefined);
        expect(await ownerGuard.canActivate(mockContext)).toBe(true);
    });

    it.only('should return true if resouce name Chat is provided and user is Owner', async () => {
        const mockContext: ExecutionContext = getMockContext(request);
        mockReflector.getAllAndOverride.mockReturnValueOnce(Resource.Chat);
        jest.spyOn(ownerGuard, 'isChatOwner').mockImplementation(
            async () => true,
        );
        expect(await ownerGuard.canActivate(mockContext)).toBe(true);
    });

    it('should throw ForbiddenException if resouce name Chat is provided and user is not the Chat owner', async () => {
        const mockContext: ExecutionContext = getMockContext(request);
        mockReflector.getAllAndOverride.mockReturnValueOnce(Resource.Chat);
        jest.spyOn(ownerGuard, 'isChatOwner').mockImplementation(
            async () => false,
        );

        expect(ownerGuard.canActivate(mockContext)).rejects.toThrow(
            ForbiddenException,
        );
    });

    it('should return true for Message owner', async () => {
        const mockContext = getMockContext(request);

        mockReflector.getAllAndOverride.mockReturnValueOnce(Resource.Message);
        redisSendResult = { createdBy: userId };
        redisClient.send();

        expect(await ownerGuard.canActivate(mockContext)).toBe(true);
    });

    it('should return true for Chat owner change message', async () => {
        const mockContext = getMockContext(request);

        mockReflector.getAllAndOverride.mockReturnValueOnce(Resource.Message);
        redisSendResult = { createdBy: 'anotheUserId' };
        redisClient.send();
        jest.spyOn(ownerGuard, 'isChatOwner').mockImplementation(
            async () => true,
        );

        expect(await ownerGuard.canActivate(mockContext)).toBe(true);
    });

    it('should return ForbiddenException if resouce name Message is provided and user is not the Chat or Message owner', async () => {
        const mockContext = getMockContext(request);

        mockReflector.getAllAndOverride.mockReturnValueOnce(Resource.Message);
        redisSendResult = { createdBy: 'anotheUserId' };
        redisClient.send();
        jest.spyOn(ownerGuard, 'isChatOwner').mockImplementation(
            async () => false,
        );

        expect(ownerGuard.canActivate(mockContext)).rejects.toThrow(
            ForbiddenException,
        );
    });
});
