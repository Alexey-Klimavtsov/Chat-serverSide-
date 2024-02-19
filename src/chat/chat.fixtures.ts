import { CreateChatDto } from './dto/create-chat.dto';

export function fixtureCreateChat(): CreateChatDto {
    const name = 'guestChat';
    const users = ['65a1e17fe449af54e6576577', '65a1e0e7e449af54e6576573'];
    return { name, users };
}
