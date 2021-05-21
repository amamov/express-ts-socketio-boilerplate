import { Document, Schema, model, Model } from "mongoose";

export interface IUser {
  username: string;
  password: string;
  avatarUrl?: string;
  age?: number;
}

export interface IUserDocument extends IUser, Document {}

interface IUserModel extends Model<IUserDocument> {}

export const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    avatarUrl: String,
    age: Number,
  },
  { timestamps: true }
);

export default model<IUserDocument, IUserModel>("user", userSchema);
