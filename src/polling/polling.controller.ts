import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { PollingService } from './polling.service';
import { CreateMessageDto } from '../message/dto/create-message.dto';
import { EVENT, MESSAGE } from '../utilits/constants';
import { MessageDocument } from '../message/schemas/message.schema';

@Controller()
export class PollingController {
    constructor(private readonly pollingService: PollingService) {}

    @EventPattern(EVENT.MESSAGE_SAVED)
    handleSavedMessage(@Payload() createMessageDto: CreateMessageDto) {
        this.pollingService.sendMessage(createMessageDto);
    }

    @EventPattern(EVENT.MESSAGE_SCHEDULED)
    handleScheduledMessage(@Payload() message: MessageDocument) {
        this.pollingService.scheduleMessage(message);
    }

    @EventPattern(EVENT.MESSAGE_UPDATED)
    handleUpdatedMessage(@Payload() createMessageDto: CreateMessageDto) {
        this.pollingService.sendMessage(
            createMessageDto,
            EVENT.MESSAGE_UPDATED,
        );
    }

    @EventPattern(EVENT.USERS_ADDED_TO_CHAT)
    async handleUsersAddedToChat(
        @Payload() { chatId, users }: { chatId: string; users: string[] },
    ) {
        users.forEach((userId) => {
            this.pollingService.connectToChat(userId, chatId);
        });
    }

    @EventPattern(EVENT.USERS_REMOVED_FROM_CHAT)
    async handleUsersRemovedFromChat(
        @Payload() { chatId, users }: { chatId: string; users: string[] },
    ) {
        users.forEach((userId) => {
            this.pollingService.disconnectFromChat(userId, chatId);
        });
    }
}
