export const FROM_EMAIL = '******'; // email
const MAIL_SERVER = 'SMTP.yandex.ru';
const MAIL_TOKEN = '*****'; //пароль почты
export const SETTINGS = {
    host: MAIL_SERVER,
    port: 465,
    secure: true,
    logger: true,
    auth: {
        user: FROM_EMAIL,
        pass: MAIL_TOKEN,
    },
};
