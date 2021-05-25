import {
  Document,
  Schema,
  model,
  Model,
  Types,
  SchemaOptions,
  NativeError,
} from "mongoose";
import validator from "validator";

export interface IUser {
  email: string;
  username: string;
  password: string;
  avatarUrl?: string;
  age?: number;
}

export interface IUserDocument extends IUser, Document {
  readonly: {
    _id: Types.ObjectId;
    email: string;
    username: string;
  };
}

interface IUserModel extends Model<IUserDocument> {}

const options: SchemaOptions = { timestamps: true };

export const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value: string) {
          return validator.isEmail(value);
        },
        message: "It's not the correct email format.",
      },
    },
    username: { type: String, trim: true, required: true, unique: true },
    password: { type: String, required: false },
    avatarUrl: String,
    age: Number,
  },
  options
);

userSchema.post(
  "save",
  function (error: any, doc: Document, next: (err?: NativeError) => void) {
    if (error.name === "MongoError" && error.code === 11000) {
      //* unique error handling
      next(new Error("That user already exists."));
    } else {
      next(error);
    }
  }
);

userSchema.post(
  "update",
  (error: any, doc: Document, next: (err?: NativeError) => void) => {
    if (error.name === "MongoError" && error.code === 11000) {
      //* unique error handling
      next(new Error("That user already exists."));
    } else {
      next();
    }
  }
);

userSchema.virtual("readonly").get(function (this: IUserDocument) {
  return {
    _id: this._id,
    email: this.email,
    username: this.username,
  };
});

export default model<IUserDocument, IUserModel>("user", userSchema);
