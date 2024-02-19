import { Test, TestingModule } from '@nestjs/testing';
import { JwtGuard } from './jwt.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { OwnerGuard } from './owner.guard';
import { fixtureCreateUser } from '../user/user.fixtures';
import { Resource } from '../enum/resource.enum';
import { ERROR } from '../utilits/constants';
import { ClientProxy } from '@nestjs/microservices';
import { REDIS_SERVICE, RedisModule } from '../utilits/redis.module';
import { Observable } from 'rxjs';

describe('JwtGuard', () => {
    let guard: JwtGuard;
    let reflector: Reflector;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtGuard, Reflector, ConfigService, JwtService],
        }).compile();

        guard = module.get<JwtGuard>(JwtGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should return true for publice access ', () => {
        const mockContext = {
            getHandler: () => {},
        } as ExecutionContext;

        jest.spyOn(reflector, 'get').mockImplementation(() => true);

        expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('chould call super.canActivate for non-public route', () => {
        const mockContext = {
            getHandler: () => {},
        } as ExecutionContext;

        const superCanActivateSpy = jest
            .spyOn(JwtGuard.prototype, 'canActivate')
            .mockImplementation(() => true);

        expect(guard.canActivate(mockContext)).toBe(true);
        expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);
    });

    it.only('should return false if token is not valid', () => {
        const mockHttpContext = {
            getRequest: jest.fn(), // Мокируем метод getRequest
            getResponse: jest.fn(), // Мокируем метод getResponse
        };
        const mockExecutionContext = {
            switchToHttp: jest.fn().mockReturnValue(mockHttpContext), // Мокируем метод switchToHttp и возвращаем объект с методами getRequest и getResponse
            getHandler: jest.fn(),
        } as unknown as ExecutionContext;

        const mockContext = {
            switchToHttp: jest.fn(() => ({
                getRequest: jest.fn(() => ({
                    headers: {
                        authorization: 'токен',
                    },
                })),
            })),
        } as unknown as ExecutionContext; // вот это главное

        jest.spyOn(reflector, 'get').mockReturnValue(false);

        const result = guard.canActivate(mockExecutionContext);

        expect(result).toBe(false);
    });
});
