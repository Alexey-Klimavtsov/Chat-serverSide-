import {
    Body,
    Controller,
    Patch,
    Post,
    Param,
    HttpStatus,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { EVENT, MESSAGE } from '../utilits/constants';
import { OwnerGuard } from '../guards/owner.guard';
import { Owner } from '../decorators/owner.decorator';
import { Resource } from '../enum/resource.enum';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enum/roles.enum';
import { Public } from '../decorators/public.decorator';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post('personal')
    async createPersonalChat(@Body() createChatDto: CreateChatDto) {
        createChatDto.type = 'personal';
        return this.chatService.create(createChatDto);
    }

    @Post(':id/admin')
    @Owner(Resource.Chat)
    async addAdmins(
        @Param('id') chatId: string,
        @Body() updateChatDto: UpdateChatDto,
    ) {
        return await this.chatService.addAdminsToChat(chatId, updateChatDto);
    }

    @Post(':chatId/ban/:userId')
    @Roles(Role.Admin)
    async banUser(
        @Param('chatId') chatId: string,
        @Param('userId') bannedUserId: string,
    ) {
        await this.chatService.banUser(chatId, bannedUserId);
        return HttpStatus.OK;
    }

    @Patch('')
    @Roles(Role.Admin)
    async unBanUser(
        @Param('chatId') chatId: string,
        @Param('userId') bannedUserId: string,
    ) {
        await this.chatService.removeUserFromBan(chatId, bannedUserId);
        return HttpStatus.OK;
    }

    @Post(':chatId/add-users')
    @Roles(Role.Admin)
    async addUsers(@Body() updateChatDto: UpdateChatDto) {
        return this.chatService.addUsersToChat(updateChatDto);
    }

    @Delete(':chatId/remove-users')
    @Roles(Role.Admin)
    async removeUsers(@Body() updateChatDto: UpdateChatDto) {
        return this.chatService.removeUsersFromChat(updateChatDto);
    }

    @Delete(':id')
    @Owner(Resource.Chat)
    async removeChat(@Param('id') id: string) {
        return await this.chatService.remove(id);
    }

    @Delete(':id/admins')
    @Owner(Resource.Chat)
    async removeAdmins(
        @Param('id') chatId: string,
        @Body() updateChatDto: UpdateChatDto,
    ) {
        return await this.chatService.removeAdminsFromChat(
            chatId,
            updateChatDto,
        );
    }

    @Delete(':chatId/message/:messageId')
    @Roles(Role.Admin)
    async removeMessage(
        @Param('chatId') chatId: string,
        @Param('messageId') messageId: string,
    ) {
        return this.chatService.sendMessage(messageId);
    }

    @MessagePattern(MESSAGE.GET_USER_CHATS)
    async getChatsByUserId(@Payload() userId: string) {
        return this.chatService.getChatsByUserId(userId);
    }

    @MessagePattern('createChat')
    create(@Payload() createChatDto: CreateChatDto) {
        return this.chatService.create(createChatDto);
    }

    @MessagePattern('findAllChat')
    findAll() {
        return this.chatService.findAll();
    }

    @MessagePattern(MESSAGE.GET_CHAT_BY_ID)
    findOne(@Payload() id: string) {
        return this.chatService.findOne(id);
    }

    @MessagePattern('updateChat')
    update(@Payload() updateChatDto: UpdateChatDto) {
        return this.chatService.update(updateChatDto.id, updateChatDto);
    }

    @MessagePattern('removeChat')
    remove(@Payload() id: string) {
        return this.chatService.remove(id);
    }
}
