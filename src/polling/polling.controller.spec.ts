import { Test, TestingModule } from '@nestjs/testing';
import { PollingController } from './polling.controller';
import { PollingService } from './polling.service';
import { RedisModule } from '../utilits/redis.module';
import { PollingGateway } from './polling.gateway';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

describe('PollingController', () => {
    let controller: PollingController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RedisModule, ConfigModule.forRoot(), JwtModule],
            controllers: [PollingController],
            providers: [PollingService, PollingGateway],
        }).compile();

        controller = module.get<PollingController>(PollingController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
