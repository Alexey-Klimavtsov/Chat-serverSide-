export class CreateRestApiTokenDto {
    username: string;
    email: string;
    _id: string;
    roles: string[];
}

export class CreateSoketTokenDto extends CreateRestApiTokenDto {
    chatIds: string[];
}
