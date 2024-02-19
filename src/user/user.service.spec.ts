import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { RedisModule } from '../utilits/redis.module';
import { UserDBModule } from './user.db';
import { UserDocument } from './schemas/user.schema';
import { fixtureCreateUser } from './user.fixtures';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpStatus } from '@nestjs/common';

describe('UserService', () => {
    let service: UserService;
    const createUserDto = fixtureCreateUser();
    let createdUser: UserDocument;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RedisModule, UserDBModule],
            providers: [UserService],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('create user', async () => {
        createdUser = await service.create(createUserDto);
        expect(createdUser.email).toBe(createUserDto.email);
    });

    it('get all user', async () => {
        const allUsers = await service.findAll();
        expect(allUsers.length).toBeGreaterThan(0);
    });

    it('get user by id', async () => {
        const userById = await service.findOne(createdUser._id.toString());
        expect(userById?.username).toEqual(createUserDto.username);
    });

    it('update user by id', async () => {
        const updateUserDto: UpdateUserDto = {
            id: createdUser._id.toString(),
            email: 'first@gmail.com',
        };
        const updatedUser = await service.update(
            createdUser._id.toString(),
            updateUserDto,
        );
        expect(updatedUser?.email).toEqual(updateUserDto.email);
    });

    it('delete user by id', async () => {
        const status = await service.remove(createdUser._id.toString());
        expect(status).toEqual(HttpStatus.OK);
    });
});
