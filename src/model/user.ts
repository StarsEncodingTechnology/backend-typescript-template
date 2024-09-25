import { AuthService } from "@src/services/authService";
import { CUSTOM_VALIDATION } from "@src/util/validations/comum";
import mongoose, { Document } from "mongoose";
import {
  BaseAfterToObject,
  BaseModel,
  BaseStringObjectId,
  convertIfNecessary,
} from ".";

/**
 * JWTInterface é o que é salvo no banco de dados
 */
export interface JWTInterface {
  createdAt: Date;
  expiresAt: Date;
  ip: string;
  jwt: string;
  active: boolean;
}

/**
 * Part of the password recovery process
 */
export interface UserToken {
  token: string;
  expiresAt: Date;
  active: boolean;
}

/**
 * Enum containing the states a user can be in,
 * This information is checked at the middleware level
 */
export enum UserState {
  /**
   * User is ready for use
   */
  active = "active",
  /**
   * When the user goes X time without using the system
   */
  inactive = "inactive",
  /**
   * State of the user who was blocked
   */
  blocked = "blocked",
  /**
   * State of the user who did not verify the email
   * @default
   */
  emailNotVerified = "emailNotVerified",
}

/**
 * Before transforming the User with .toJSON()
 */
export interface User extends BaseModel {
  active?: BaseStringObjectId | null;
  name?: string;
  email: string;
  password: string;
  JWTs: JWTInterface[];
  changePassword: UserToken[];
  state: UserState;
  /**
   * It is the cliente_id field of the payment API
   */
  clientId?: string;
}

export interface UserWithId extends User {
  id: string;
  active: string;
}

/**
 * After transforming the User with .toJSON()
 */
export interface UserAfterToJSON
  extends Omit<
    UserWithId,
    "password" | "JWTs" | "email" | "changePassword" | "clientId"
  > {}

export interface UserAfterToObject
  extends BaseAfterToObject<UserWithId, UserAfterToJSON> {}

const schema = new mongoose.Schema<User>(
  {
    name: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    JWTs: {
      type: [
        {
          createdAt: { type: Date, required: true },
          expiresAt: { type: Date, required: true },
          ip: { type: String, required: true },
          jwt: { type: String, required: true },
          active: { type: Boolean, required: true },
        },
      ],
      default: [],
    },
    changePassword: {
      type: [
        {
          token: { type: String, required: true },
          expiresAt: { type: Date, required: true },
          active: { type: Boolean, required: true },
        },
      ],
      default: [],
    },
    state: {
      type: String,
      required: true,
      enum: Object.values(UserState),
      default: UserState.emailNotVerified,
    },
    clientId: { type: String, required: false },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;

        ret.password = undefined;
        ret.email = undefined;
        ret.JWTs = undefined;
        ret.changePassword = undefined;
        ret.clientId = undefined;
      },
    },

    toObject: {
      transform: (_, ret): void => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;

        convertIfNecessary(ret, ["_id"]);

        ret.toJSON = () => {
          return JSON.parse(
            JSON.stringify({
              ...ret,
              toJSON: undefined,
              password: undefined,
              email: undefined,
              JWTs: undefined,
              changePassword: undefined,
              clientId: undefined,
            })
          );
        };
      },
    },

    versionKey: false,
  }
);

interface UserModel extends Omit<User, "_id">, Document {}

schema.path("email").validate(
  async (email: string) => {
    const emailCount = await mongoose.models.User.countDocuments({ email });
    return !emailCount;
  },
  "Email already registered.",
  CUSTOM_VALIDATION.DUPLICATED
);

schema.pre<UserModel>("save", async function (): Promise<void> {
  if (!this.password || !this.isModified("password")) return;

  try {
    const passwordHash = await AuthService.hashPassword(this.password);
    this.password = passwordHash;
  } catch (e) {
    console.error(`Error hashing the password for user ${this.name}`);
  }
});

export const User = mongoose.model<User>("User", schema);
