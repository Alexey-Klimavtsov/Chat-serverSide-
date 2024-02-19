import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './schemas/message.schema';

export function fixtureCreateMessage(): CreateMessageDto {
    const text: string = 'Hi! this is test';
    const createdAt: Date = new Date();
    const createdBy: string = '65a21a6d2b00d1473c91695b';
    const chatId = 'chatId';

    return { text, createdAt, createdBy, chatId };
}
