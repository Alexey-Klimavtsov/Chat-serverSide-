import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../user/schemas/user.schema';

export type ChatDocument = HydratedDocument<Chat>;
export type ChatType = 'personal' | 'private' | 'channel';

@Schema()
export class Chat {
    @Prop()
    name: string;

    @Prop()
    users: string[];

    @Prop()
    type?: ChatType;

    @Prop()
    createdBy: string;

    @Prop()
    admins?: string[];

    @Prop()
    bannedUsers?: string[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.path('users').validate(function (users: string[]) {
    return this.type ? validateMaxUsers(this.type, users) : true;
});

function validateMaxUsers(type: ChatType, users: string[]): boolean {
    if (type === 'personal' && users.length > 2) {
        return false;
    }
    return true;
}
