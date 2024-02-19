import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Chat } from '../../chat/schemas/chat.schema';

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {
    @Prop()
    text: string;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop()
    createdBy: string;

    @Prop()
    chatId: string;

    @Prop({ default: null })
    seenAt?: Date;

    @Prop({ default: false })
    isDeleted?: boolean;

    @Prop({ default: null })
    deletedAt?: Date;

    @Prop({ default: null })
    scheduled?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
