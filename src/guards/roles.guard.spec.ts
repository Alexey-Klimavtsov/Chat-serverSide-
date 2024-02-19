import { Test } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Resource } from '../enum/resource.enum';
import { MessageDocument } from '../message/schemas/message.schema';
import { getMockContext } from './fixtures.guard';
import { Role } from '../enum/roles.enum';
import { ChatDocument } from '../chat/schemas/chat.schema';

describe('Roles Guard', () => {
    let rolesGuard: RolesGuard;

    const userId = 'userId';
    const chatId = 'chatId';
    const request = {
        user: { _id: userId },
        params: { chatId: chatId },
    };

    const mockReflector = {
        getAllAndOverride: jest.fn(),
    };

    let redisSendResult: Partial<ChatDocument>;
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
                RolesGuard,
                { provide: Reflector, useValue: mockReflector },
                { provide: 'REDIS_SERVICE', useValue: redisClient },
            ],
        }).compile();

        rolesGuard = moduleRef.get<RolesGuard>(RolesGuard);
    });

    it('should be defined', () => {
        expect(rolesGuard).toBeDefined();
    });

    it('should return true if roles is not specified', async () => {
        const mockContext: ExecutionContext = getMockContext(request);
        mockReflector.getAllAndOverride.mockReturnValueOnce(undefined);
        expect(await rolesGuard.canActivate(mockContext)).toBe(true);
    });

    it('should return true if roles provided (admin) and user is chat admin', async () => {
        const mockContext: ExecutionContext = getMockContext(request);
        mockReflector.getAllAndOverride.mockReturnValueOnce([Role.Admin]);
        redisSendResult = { admins: [userId] };
        expect(await rolesGuard.canActivate(mockContext)).toBe(true);
    });

    it('should return true if roles provided (admin) and user is owner chat', async () => {
        const mockContext: ExecutionContext = getMockContext(request);
        mockReflector.getAllAndOverride.mockReturnValueOnce([Role.Admin]);
        redisSendResult = { admins: [userId], createdBy: userId };
        expect(await rolesGuard.canActivate(mockContext)).toBe(true);
    });

    it('should return true if roles provided (admin) and user is not admin and not owner chat', async () => {
        const mockContext: ExecutionContext = getMockContext(request);
        mockReflector.getAllAndOverride.mockReturnValueOnce([Role.Admin]);
        redisSendResult = { admins: ['anotherUser'], createdBy: 'anotherUser' };
        expect(rolesGuard.canActivate(mockContext)).rejects.toThrow(
            ForbiddenException,
        );
    });
});
