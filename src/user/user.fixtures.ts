import { Role } from './dto/create-user.dto';

export function fixtureCreateUser() {
    const username = 'randomizeName' + getRandomNumber(1, 100);
    const email = 'rndMail' + getRandomNumber(1, 100);
    const password = getRandomNumber(1, 999999).toString();
    const roles: Role[] = ['user'];
    return { username, email, password, roles };
}

function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
