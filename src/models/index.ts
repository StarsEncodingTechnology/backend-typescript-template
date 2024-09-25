import Validator from "@src/utils/validations/validateInfo";
import { Types } from "mongoose";

export interface BaseModel {}

/**
 * Base type when using ObjectId
 */
export type BaseStringObjectId = string | Types.ObjectId;

/**
 * Base type for toJSON
 */
export type BaseAfterToObject<T, K> = T & {
  /**
   * In case of an error with some information, it may be a conversion error, as it is not linked to toJSON
   */ toJSON: () => K;
};

/**
 * Converts a field to ObjectId to String if it is, if not,
 * Converts to the type that is in the field.
 * Makes the change directly in the passed object
 * @param ret Information obtained from the database when toObject is executed
 * @param fields Fields that will go through the conversion
 * @returns the modified ret
 */
export function convertIfNecessary(
  ret: Record<string, unknown>,
  fields: string[]
): undefined {
  fields.forEach((field) => {
    const beforeField = ret[field] as
      | Types.ObjectId
      | Record<string, unknown>
      | Types.ObjectId[]
      | Record<string, unknown>[]
      | string
      | null;

    if (!beforeField) return;

    if (typeof beforeField === "string") return;

    if (Validator.ObjectIdMongoose(beforeField as Types.ObjectId)) {
      if (field === "_id") {
        ret["id"] = beforeField.toString();
        delete ret["_id"];
        return;
      }

      ret[field] = beforeField.toString();
      return;
    }

    if (Array.isArray(beforeField)) {
      ret[field] = beforeField.map((item) => {
        if (Validator.ObjectIdMongoose(item as Types.ObjectId)) {
          return item.toString();
        }

        if (typeof item === "object") {
          convertIfNecessary(
            item as Record<string, unknown>,
            Object.keys(item)
          );
        }

        return item;
      });

      return;
    }

    if (typeof beforeField === "object") {
      convertIfNecessary(
        beforeField as Record<string, unknown>,
        Object.keys(beforeField)
      );
    }
  });

  return;
}
