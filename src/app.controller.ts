import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDto } from './user/dto/create-user.dto';
import { Observable } from 'rxjs';
import { CreateMessageDto } from './message/dto/create-message.dto';
import { firstValueFrom } from 'rxjs';
import { UserDocument } from './user/schemas/user.schema';
import { Public } from './decorators/public.decorator';

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);

    constructor(private readonly appService: AppService) {}

    @Post('user')
    @Public()
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.appService.create(createUserDto);
    }

    @Get()
    @Public()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('user/:id')
    async getUserById(@Param('id') id: string) {
        this.logger.debug('app debug');
        this.logger.log('app log');
        return this.appService.getUserById(id);
    }
}
