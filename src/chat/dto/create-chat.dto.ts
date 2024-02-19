import { ChatType } from '../schemas/chat.schema';

export class CreateChatDto {
    name: string;
    users: string[];
    type?: ChatType;
    admins?: string[];
}
