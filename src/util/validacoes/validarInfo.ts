/**
 * OBJ contém diversos tipos de validação
 */

import { Types } from "mongoose";

const ValidarInfo = {
  /**
   * Valido a string e checa se é um CNPJ
   * @param info contém o possivel CNPJ
   */
  CNPJ(info: string): boolean {
    const cnpj = info.replace(/[^\d]+/g, "");

    if (cnpj == "") return false;
    if (cnpj.length != 14) return false;

    // Elimina CNPJs invalidos conhecidos
    if (
      cnpj == "00000000000000" ||
      cnpj == "11111111111111" ||
      cnpj == "22222222222222" ||
      cnpj == "33333333333333" ||
      cnpj == "44444444444444" ||
      cnpj == "55555555555555" ||
      cnpj == "66666666666666" ||
      cnpj == "77777777777777" ||
      cnpj == "88888888888888" ||
      cnpj == "99999999999999"
    )
      return false;

    // Valida DVs
    let tamanho: number = cnpj.length - 2;
    let numeros: string = cnpj.substring(0, tamanho);
    const digitos: string = cnpj.substring(tamanho);
    let soma = 0;
    let pos: number = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado: number = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != parseInt(digitos.charAt(1))) return false;

    return true;
  },
  /**
   *  Valida se string só contém números.
   * @param info Contém o possivel Number
   */
  Numero(info: string): boolean {
    return /^\d+$/.test(info);
  },

  /**
   * Valida se string é um CNAE
   * @param info Contém possivel Cnae
   */
  CNAE(info: string): boolean {
    if (info.length != 7) return false;
    if (!this.Numero(info)) return false;
    return true;
  },

  /**
   * Valida se string é um CEP
   * @param info Contém um possivel CEP
   */
  CEP(info: string): boolean {
    if (info.length != 8) return false;
    if (!this.Numero(info)) return false;
    return true;
  },

  /**
   * Valida se number/tring está entre os parametros passados
   * @param testado string/number que contém um possivel numero
   * @param min  number minimo para validação
   * @param max  number maximo para validação
   * @returns Retorna um boolean, vindo true caso o número exista entre o min e max.
   */
  EntreNumeros(testado: string | number, min: number, max: number): boolean {
    if (typeof testado == "string")
      if (!this.Numero(testado)) return false;
      else testado = parseInt(testado);

    if (testado >= min && testado <= max) return true;

    return false;
  },

  /**
   * Faz a validação da informação se é realmente um
   * Object id mongoose
   * @param info
   */
  ObjectIdMongoose(info: string): boolean {
    const { ObjectId } = Types;
    if (ObjectId.isValid(info)) {
      if (String(new ObjectId(info)) == info) return true;
      // Está dizendo que o retorno de new ObjectID é string
      return false;
    }

    return false;
  },

  Booleano(info: string | boolean): boolean {
    if (typeof info == "string")
      info == "true" || info == "false" ? (info = true) : (info = "não é");

    return typeof info == "boolean";
  },
};

export default ValidarInfo;
