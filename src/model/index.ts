import Validador from "@src/util/validacoes/validarInfo";
import { Types } from "mongoose";

export interface BaseModel {}

/**
 * Tipo base quando for usar o ObjectId
 */
export type BaseStringObjectId = string | Types.ObjectId;

/**
 * Tipo base para o toJSON
 */
export type BaseDepoisToObject<T, K> = T & {
  /**
   * Em caso de error com alguma informação pode ser erro de conversão, por não ser vinculado ao to toJSON
   */ toJSON: () => K;
};

/**
 * Faz a conversão de um campo para ObjectId para String caso seja, caso não seja,
 * Converte para o tipo que está no campo.
 * Faz a mudança direto no objeto passado
 * @param ret Informação obtida do banco de dados quando toObject é executado
 * @param campos Campos que vão passar pela conversão
 * @returns o ret modificado
 */
export function converteCasoNecessario(
  ret: Record<string, unknown>,
  campos: string[]
): undefined {
  campos.forEach((campo) => {
    const antesCampo = ret[campo] as
      | Types.ObjectId
      | Record<string, unknown>
      | Types.ObjectId[]
      | Record<string, unknown>[]
      | string
      | null;

    if (!antesCampo) return;

    if (typeof antesCampo === "string") return;

    if (Validador.ObjectIdMongoose(antesCampo as Types.ObjectId)) {
      if (campo === "_id") {
        ret["id"] = antesCampo.toString();
        delete ret["_id"];
        return;
      }

      ret[campo] = antesCampo.toString();
      return;
    }
    // asd

    if (Array.isArray(antesCampo)) {
      ret[campo] = antesCampo.map((item) => {
        if (Validador.ObjectIdMongoose(item as Types.ObjectId)) {
          return item.toString();
        }

        if (typeof item === "object") {
          converteCasoNecessario(
            item as Record<string, unknown>,
            Object.keys(item)
          );
        }

        return item;
      });

      return;
    }

    if (typeof antesCampo === "object") {
      converteCasoNecessario(
        antesCampo as Record<string, unknown>,
        Object.keys(antesCampo)
      );
    }
  });

  return;
}
