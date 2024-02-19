import { ConfigService, ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from './schemas/chat.schema';

export const DB_CONNECTION_NAME = 'chat';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get('MONGO_CONNECTION_STRING_CHAT'),
            }),
            connectionName: DB_CONNECTION_NAME,
            inject: [ConfigService],
        }),
        MongooseModule.forFeature(
            [{ name: 'Chat', schema: ChatSchema }],
            DB_CONNECTION_NAME,
        ),
    ],
})
export class ChatDBModule {}
