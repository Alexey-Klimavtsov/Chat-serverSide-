import { Controller, Headers, Post } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateRestApiTokenDto } from './dto/createToken-auth.dto';
import { EVENT, MESSAGE } from '../utilits/constants';
import { UserDocument } from '../user/schemas/user.schema';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @MessagePattern(MESSAGE.GENERATE_TOKEN)
    generateToken(@Payload() createTokenAuthDto: CreateRestApiTokenDto) {
        return this.authService.generateToken(createTokenAuthDto);
    }

    @EventPattern(EVENT.USER_CREATED)
    sendInvite(@Payload() user: UserDocument) {
        this.authService.sendInvite(user);
    }

    @Post('connectToSocket')
    generateSocketToken(@Headers('Authorization') token: string) {
        return this.authService.generateSocketToken(token);
    }
}
