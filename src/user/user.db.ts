import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { ConfigService, ConfigModule } from '@nestjs/config';

export const DB_CONNECTION_NAME = 'user';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get('MONGO_CONNECTION_STRING_USER'),
            }),
            connectionName: DB_CONNECTION_NAME,
            inject: [ConfigService],
        }),
        MongooseModule.forFeature(
            [{ name: 'User', schema: UserSchema }],
            DB_CONNECTION_NAME,
        ),
    ],
    providers: [ConfigService],
})
export class UserDBModule {}
