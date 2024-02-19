import { Inject, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateRestApiTokenDto } from './dto/createToken-auth.dto';
import { MailService } from './mail.service';
import { REDIS_SERVICE } from '../utilits/redis.module';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { UserDocument } from '../user/schemas/user.schema';
import { EVENT } from '../utilits/constants';

@Injectable()
export class AuthService {
    constructor(
        @Inject(REDIS_SERVICE) private redisClient: ClientProxy,
        private jwtService: JwtService,
        private configService: ConfigService,
        private mailService: MailService,
    ) {}

    generateToken(
        { email, _id, roles, username }: CreateRestApiTokenDto,
        isSocketSecretKeyValid = false,
    ) {
        const keyName = isSocketSecretKeyValid ? 'JWT_SOCKET' : 'JWT_REST';
        const secret = this.configService.get(keyName);

        return this.jwtService.sign(
            { email, _id, roles, username },
            { secret },
        );
    }

    sendInvite(user: UserDocument) {
        const createTokenDto: CreateRestApiTokenDto = {
            username: user.username,
            _id: user._id.toString(),
            email: user.email,
            roles: user.roles,
        };

        const htmlLink = this.getLink(createTokenDto);

        this.mailService.sendMessage({
            email: createTokenDto.email,
            html: htmlLink,
            subject: 'Волшебная ссылка',
        });
    }

    getLink(createTokenAuthDto: CreateRestApiTokenDto) {
        const isSocketSecretKeyValid = false;
        const token = this.generateToken(
            createTokenAuthDto,
            isSocketSecretKeyValid,
        );

        const clientUrl = this.configService.get('CLIENT_URL');
        const link = `${clientUrl}/auth/${token}`;
        const html = `<p><a href="${link}">Войти в аккаунт</a></p>`;
        return html;
    }

    getPayloadFromToken(token: string, isSocketSecretKeyValid = false) {
        const keyName = isSocketSecretKeyValid ? 'JWT_SOCKET' : 'JWT_REST';
        const secret = this.configService.get(keyName);
        const payload = this.jwtService.verify(token, secret);
        return payload;
    }

    async generateSocketToken(token: string) {
        let isSocketSecretKeyValid = false;
        const payload = this.getPayloadFromToken(
            token,
            isSocketSecretKeyValid,
        ) as CreateRestApiTokenDto;

        isSocketSecretKeyValid = true;
        return this.generateToken(payload, isSocketSecretKeyValid);
    }
}
