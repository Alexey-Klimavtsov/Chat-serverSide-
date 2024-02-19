import { MessageSchema, Message } from '../schemas/message.schema';

export class CreateMessageDto implements Message {
    text: string;
    createdAt: Date;
    createdBy: string;
    chatId: string;
    isDeleted?: boolean | undefined;
    scheduled?: Date | undefined;
}
