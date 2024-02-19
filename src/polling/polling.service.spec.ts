import { Test, TestingModule } from '@nestjs/testing';
import { PollingService } from './polling.service';
import { RedisModule } from '../utilits/redis.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

describe('PollingService', () => {
    let service: PollingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RedisModule, JwtModule, ConfigModule.forRoot()],
            providers: [PollingService],
        }).compile();

        service = module.get<PollingService>(PollingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
