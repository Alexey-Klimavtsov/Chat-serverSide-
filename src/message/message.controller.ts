import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Seen } from '../polling/polling.gateway';
import { EVENT, MESSAGE } from '../utilits/constants';
import { MessageDocument } from './schemas/message.schema';
import { Owner } from '../decorators/owner.decorator';
import { Resource } from '../enum/resource.enum';

@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Get('history')
    async getHistory(
        @Query() { messageHistoryDays }: { messageHistoryDays: number },
    ) {
        return this.messageService.getHistory(messageHistoryDays);
    }

    @Delete('softDelete/:id')
    @Owner(Resource.Message)
    async softRemoveMessage(@Param('id') id: string) {
        await this.messageService.softRemove(id);
        return HttpStatus.OK;
    }

    @Patch('softDelete/:id')
    @Owner(Resource.Message)
    async canserlRemoveMessage(@Param('id') id: string) {
        await this.messageService.cancelRemove(id);
        return HttpStatus.OK;
    }

    @Delete(':id')
    @Owner(Resource.Message)
    async removeMessage(@Param('id') id: string) {
        await this.messageService.remove(id);
        return HttpStatus.OK;
    }

    @EventPattern(EVENT.CHAT_MESSAGE_APPROVED)
    async create(@Payload() createMessageDto: CreateMessageDto) {
        this.messageService.create(createMessageDto);
    }

    @MessagePattern('findAllMessage')
    findAll() {
        return this.messageService.findAll();
    }

    @MessagePattern(MESSAGE.GET_MESSAGE_BY_ID)
    async findOne(@Payload() id: string) {
        return this.messageService.findOne(id);
    }

    @MessagePattern('updateMessage')
    async update(@Payload() updateMessageDto: UpdateMessageDto) {
        return this.messageService.update(
            updateMessageDto.id,
            updateMessageDto,
        );
    }

    @MessagePattern(MESSAGE.REMOVE_MESSAGE_SOFT)
    remove(@Payload() id: string) {
        return this.messageService.softRemove(id);
    }

    @EventPattern(EVENT.MESSAGE_READED)
    async markMessageAsRead(@Payload() updateMessageDto: Seen) {
        const updatedMessage = await this.messageService.markMessageAsRead(
            updateMessageDto.messageId,
        );
        this.messageService.sendEvent(EVENT.MESSAGE_UPDATED, updatedMessage);
    }
}
