import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { fixtureCreateTokenDto } from './auth.fixtures';
import { MailService } from './mail.service';

describe('AuthService', () => {
    let service: AuthService;
    const createTokenDto = fixtureCreateTokenDto();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot()],
            providers: [AuthService, JwtService, MailService],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should generate token', () => {
        const token = service.generateToken(createTokenDto);
        console.log(token);
    });
});
