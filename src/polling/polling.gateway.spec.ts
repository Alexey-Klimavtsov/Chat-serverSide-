import { Test } from '@nestjs/testing';
import { PollingGateway } from './polling.gateway';
import { PollingService } from './polling.service';
import { Socket, io } from 'socket.io-client';
import { RedisModule } from '../utilits/redis.module';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { fixtureCreateTokenDto } from '../auth/auth.fixtures';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailService } from '../auth/mail.service';

describe('PollingGateway', () => {
    let gateway: PollingGateway;
    let authService: AuthService;
    let app: INestApplication;
    let ioClient: Socket;
    let testToken: string;

    beforeEach(async () => {
        const testingModule = await Test.createTestingModule({
            imports: [
                RedisModule,
                AuthModule,
                ConfigModule.forRoot(),
                PassportModule,
                JwtModule,
            ],
            providers: [
                PollingGateway,
                PollingService,
                AuthService,
                JwtService,
                MailService,
                ConfigService,
            ],
        }).compile();

        gateway = testingModule.get<PollingGateway>(PollingGateway);
        authService = testingModule.get<AuthService>(AuthService);
        const restApiToken = authService.generateToken(fixtureCreateTokenDto());
        console.log(restApiToken);
        ioClient = io('ws://localhost:3001', {
            autoConnect: false,
            transports: ['websocket'],
            auth: { token: restApiToken },
        });

        app = await testingModule.createNestApplication();
        app.listen(3001);
    });

    afterEach(async () => {
        await app.close();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('should emit -pong', async () => {
        ioClient.connect();

        await new Promise<void>((resolve) => {
            ioClient.on('connect', () => {
                ioClient.emit('ping');
            });
            ioClient.on('pong', (data) => {
                expect(data).toBe('pong data');
                resolve();
            });
        });
        ioClient.disconnect();
    });
});
