import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({ required: true, unique: false })
    username: string;

    @Prop({ required: true, unique: false })
    email: string;

    @Prop()
    password: string;

    @Prop()
    roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
