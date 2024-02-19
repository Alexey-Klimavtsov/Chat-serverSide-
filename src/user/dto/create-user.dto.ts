export type Role = 'admin' | 'user';

export class CreateUserDto {
    username: string;
    email: string;
    password: string;
    roles: Role[];
}
