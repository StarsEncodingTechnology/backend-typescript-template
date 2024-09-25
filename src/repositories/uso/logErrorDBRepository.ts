import {
  ErrorsGroupedByCode,
  LogError,
  LogErrorAfterToObject,
} from "@src/models/logError";
import Validator from "@src/utils/validations/validateInfo";
import mongoose from "mongoose";
import { FilterOptions, LogErrorRepository } from "..";
import { BaseDefaultMongoDB } from "../baseDefaultMongoDB";

export class LogErrorDBRepository
  extends BaseDefaultMongoDB<LogError, LogErrorAfterToObject>
  implements LogErrorRepository
{
  constructor(LogErrorModel = LogError) {
    super(LogErrorModel);
  }

  private organizeFilter(filter: FilterOptions) {
    const keys = Object.keys(filter);

    const newFilter: FilterOptions = {};

    keys.forEach((key) => {
      if (filter[key] !== undefined) {
        const item = filter[key];

        if (typeof item == "string" && Validator.ObjectIdMongoose(item)) {
          newFilter[key] = new mongoose.Types.ObjectId(item);
          return;
        }

        if (typeof item == "object" && Validator.isDate(String(item))) {
          newFilter[key] = item;
          return;
        }

        if (typeof item == "object" && item !== null) {
          newFilter[key] = this.organizeFilter(item as FilterOptions);
          return;
        }

        newFilter[key] = filter[key];
      }
    });

    return newFilter;
  }

  public async groupByCode(
    filter: FilterOptions
  ): Promise<ErrorsGroupedByCode[]> {
    try {
      const newFilter = this.organizeFilter(filter);

      const grouped = await this.model.aggregate([
        {
          $match: newFilter,
        },
        {
          $group: {
            _id: "$code",
            count: { $sum: 1 },
            code: { $first: "$code" },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      return grouped;
    } catch (error) {
      this.handlerError(error);
    }
  }
}
