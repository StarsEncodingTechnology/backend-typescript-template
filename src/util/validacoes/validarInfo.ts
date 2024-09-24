/**
 * OBJ contém diversos tipos de validação
 */

import { Types } from "mongoose";

export default class Validador {
  /**
   * Validar se a string é um CPF
   * @param info Contém o possivel CPF
   */
  public static CPF(info: string): boolean {
    const cpf = info.replace(/[^\d]+/g, "");

    if (cpf == "") return false;
    if (cpf.length != 11) return false;

    // Elimina CPFs invalidos conhecidos
    if (
      cpf == "00000000000" ||
      cpf == "11111111111" ||
      cpf == "22222222222" ||
      cpf == "33333333333" ||
      cpf == "44444444444" ||
      cpf == "55555555555" ||
      cpf == "66666666666" ||
      cpf == "77777777777" ||
      cpf == "88888888888" ||
      cpf == "99999999999"
    )
      return false;

    // Valida 1o digito
    let add: number = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev: number = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(9))) return false;

    // Valida 2o digito
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(10))) return false;

    return true;
  }

  /**
   * Valido a string e checa se é um CNPJ
   * @param info contém o possivel CNPJ
   */
  public static CNPJ(info: string): boolean {
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
  }
  /**
   *  Valida se string só contém números.
   * @param info Contém o possivel Number
   */
  public static Numero(info: string): boolean {
    return /^\d+$/.test(`${info}`.replace(".", ""));
  }
  /**
   * Valida se string é um CNAE
   * @param info Contém possivel Cnae
   */
  public static CNAE(info: string): boolean {
    if (info.length != 7) return false;
    if (!this.Numero(info)) return false;
    return true;
  }

  /**
   * Valida se string é um CEP
   * @param info Contém um possivel CEP
   */
  public static CEP(info: string): boolean {
    if (info.length != 8) return false;
    if (!this.Numero(info)) return false;
    return true;
  }

  /**
   * Valida se number/tring está entre os parametros passados
   * @param testado string/number que contém um possivel numero
   * @param min  number minimo para validação
   * @param max  number maximo para validação
   * @returns Retorna um boolean, vindo true caso o número exista entre o min e max.
   */
  public static EntreNumeros(
    testado: string | number,
    min: number,
    max: number
  ): boolean {
    if (typeof testado == "string")
      if (!this.Numero(testado)) return false;
      else testado = parseInt(testado);

    if (testado >= min && testado <= max) return true;

    return false;
  }
  /**
   * Faz a validação da informação se é realmente um
   * Object id mongoose
   * @param info
   */
  public static ObjectIdMongoose(info: string | Types.ObjectId): boolean {
    const ObjectId = Types.ObjectId;

    if (ObjectId.isValid(info)) {
      if (String(new ObjectId(info)) == info) return true;
      // Está dizendo que o retorno de new ObjectID é string
      return false;
    }

    return false;
  }

  public static Booleano(info: string | boolean): boolean {
    if (typeof info == "string")
      info == "true" || info == "false" ? (info = true) : (info = "não é");

    return typeof info == "boolean";
  }

  /**
   * Faz a validação de email
   */
  public static Email(info: string): boolean {
    const re = /\S+@\S+\.\S+/;
    return re.test(info);
  }

  /**
   * Faz a validação de senha com pelo menos 8 carecteres
   * @param info
   * @returns retorna senha é valida
   */
  public static Password(info: string): boolean {
    return (
      /[A-Z]/.test(info) &&
      /[a-z]/.test(info) &&
      /[0-9]/.test(info) &&
      /[^A-Za-z0-9]/.test(info) &&
      info.length > 7 &&
      info.length < 21 &&
      info.indexOf("1234") == -1 &&
      info.indexOf("4321") == -1 &&
      info.indexOf("102030") == -1
    );
  }

  /**
   * Faz a validação de data
   * @param info
   * @returns
   */
  public static isDate(info: string): boolean {
    const test = new Date(info);

    return test.toString() != "Invalid Date";
  }

  /**
   * Faz a validação de cor hexadecimal
   * @param info Informação a ser validada
   */
  public static isHexColor(info: string): boolean {
    const regex = /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i;
    return regex.test(info);
  }

  /**
   * Validação entre datas
   * @param data Data a ser validada
   * @param dataMin Data minima
   * @param dataMax Data maxima
   */
  public static entreDatas(data: Date, dataMin: Date, dataMax: Date): boolean {
    return data >= dataMin && data <= dataMax;
  }

  /**
   * Checa se o número é inteiro
   * @param numb Número a ser testado
   */
  public static inteiro(numb: number): boolean {
    if (typeof numb !== "number") return false;

    return numb % 1 == 0;
  }

  /**
   * Checa
   * @param cvv String com 3 digitos
   * @returns
   */
  public static cvv(cvv: string): boolean {
    if (typeof cvv !== "string") return false;
    if (!this.Numero(cvv)) return false;
    if (!this.inteiro(Number(cvv))) return false;

    return cvv.length == 3;
  }

  /**
   * Faz a validação de cartão
   * @param numero do cartão
   * @returns boolean
   */
  public static cartao(numero: string): boolean {
    if (typeof numero !== "string") return false;
    if (!this.Numero(numero)) return false;

    return numero.length == 16;
  }

  public static validadeCartao(validade: string): boolean {
    if (typeof validade !== "string") return false;
    if (validade.indexOf("/") == -1) return false;

    const [mes, ano] = validade.split("/");

    if (!this.Numero(mes)) return false;
    if (!this.Numero(ano)) return false;

    return new Date(`${ano}-${Number(mes) - 1}`) > new Date();
  }

  public static telefone(numero: string): boolean {
    if (typeof numero !== "string") return false;
    if (!this.Numero(numero)) return false;

    return numero.length == 11 || numero.length == 10;
  }
}
