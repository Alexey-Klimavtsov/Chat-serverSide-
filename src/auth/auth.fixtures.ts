import { CreateRestApiTokenDto } from './dto/createToken-auth.dto';

export function fixtureCreateTokenDto(): CreateRestApiTokenDto {
    return {
        username: 'Alex',
        email: 'test@test.com',
        _id: 'userId',
        roles: ['user'],
    };
}
