import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CreateRestApiTokenDto } from '../auth/dto/createToken-auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_REST'),
            ignoreExpiration: true,
        });
        this.logger.debug('jwt strategy');
    }

    async validate(payload: CreateRestApiTokenDto) {
        this.logger.debug('jwt strategy validate');
        return payload;
    }
}
