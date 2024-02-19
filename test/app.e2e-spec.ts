import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { fixtureCreateUser } from '../src/user/user.fixtures';
import { Transport } from '@nestjs/microservices';
import { AuthModule } from '../src/auth/auth.module';
import { ChatModule } from '../src/chat/chat.module';
import { MessageModule } from '../src/message/message.module';
import { PollingModule } from '../src/polling/polling.module';
import { UserModule } from '../src/user/user.module';
import { RedisModule } from '../src/utilits/redis.module';
import { UserService } from '../src/user/user.service';
import { UserDocument } from '../src/user/schemas/user.schema';
import { CreateRestApiTokenDto } from '../src/auth/dto/createToken-auth.dto';
import { AuthService } from '../src/auth/auth.service';
import { Observable, lastValueFrom } from 'rxjs';

let tokenRestApi: string;

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let userService: UserService;
    let authService: AuthService;
    let user: UserDocument;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AppModule,
                UserModule,
                ChatModule,
                MessageModule,
                PollingModule,
                AuthModule,
                RedisModule,
            ],
        }).compile();

        userService = moduleFixture.get<UserService>(UserService);
        authService = moduleFixture.get<AuthService>(AuthService);

        const users: UserDocument[] = await userService.findAll();
        user = users[0];
        const createRestApiTokenDto: CreateRestApiTokenDto = {
            ...user,
            _id: user.id.toString(),
        };
        tokenRestApi = authService.generateToken(createRestApiTokenDto);

        app = moduleFixture.createNestApplication();
        await app.init();
        app.connectMicroservice({
            transport: Transport.REDIS,
            options: {
                port: 6379,
            },
        });
        await app.startAllMicroservices();
        // await new Promise((resolve) => setTimeout(resolve, 10000));
        await app.listen(4000);
    });

    afterAll(async () => {
        await app.close();
    });

    it('/ (GET)', () => {
        return request(app.getHttpServer())
            .get('/')
            .expect(200)
            .expect('Hello World!');
    });

    it.skip('"/user" (POST)', () => {
        const createUserDto: CreateUserDto = fixtureCreateUser();
        jest.spyOn(userService, 'sendEvent').mockImplementation(
            async () => undefined,
        );
        return request(app.getHttpServer())
            .post('/user')
            .send(createUserDto)
            .expect(HttpStatus.CREATED);
    });

    it('users/:id (GET) Unauthorized', async () => {
        const userId = user._id.toString();
        const resultPromise = request(app.getHttpServer()).get(
            `/user/${userId}`,
        );
        const result = await resultPromise;
        expect(result.status).toEqual(401);
    });

    it('users/:id (GET) ', async () => {
        const userId = user._id.toString();
        const resultPromise = request(app.getHttpServer())
            .get(`/user/${userId}`)
            .set('Authorization', `Bearer ${tokenRestApi}`);
        const result = await resultPromise;
        expect(result.status).toEqual(200);
        expect(result.body._id).toEqual(userId);
    });
});
