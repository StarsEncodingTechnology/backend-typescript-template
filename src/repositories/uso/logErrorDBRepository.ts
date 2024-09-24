import {
  LogError,
  LogErrorDepoisToObject,
  LogErrosAgrupadosPorCode,
} from "@src/model/logError";
import Validador from "@src/util/validacoes/validarInfo";
import mongoose from "mongoose";
import { FilterOptions, LogErrorRepository } from "..";
import { BasePadraoMongoDB } from "../basePadraoMongoDB";

export class LogErrorDBRepository
  extends BasePadraoMongoDB<LogError, LogErrorDepoisToObject>
  implements LogErrorRepository
{
  constructor(LogErrorModel = LogError) {
    super(LogErrorModel);
  }

  private organizaFiltro(filtro: FilterOptions) {
    const keys = Object.keys(filtro);

    const novoFiltro: FilterOptions = {};

    keys.forEach((key) => {
      if (filtro[key] !== undefined) {
        const item = filtro[key];

        if (typeof item == "string" && Validador.ObjectIdMongoose(item)) {
          novoFiltro[key] = new mongoose.Types.ObjectId(item);
          return;
        }

        if (typeof item == "object" && Validador.isDate(String(item))) {
          novoFiltro[key] = item;
          return;
        }

        if (typeof item == "object" && item !== null) {
          novoFiltro[key] = this.organizaFiltro(item as FilterOptions);
          return;
        }

        novoFiltro[key] = filtro[key];
      }
    });

    return novoFiltro;
  }

  public async agruparPorCode(
    filtro: FilterOptions
  ): Promise<LogErrosAgrupadosPorCode[]> {
    try {
      const filtroN = this.organizaFiltro(filtro);

      const agrupado = await this.model.aggregate([
        {
          $match: filtroN,
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

      return agrupado;
    } catch (error) {
      this.handlerError(error);
    }
  }
}
