interface IPrimeiroEUltimoDiaDoMes {
  primeiroDia: Date;
  ultimoDia: Date;
}

/**
 * Enum para os dias da semana
 */
enum SemanaEnum {
  segunda = "segunda",
  terca = "terca",
  quarta = "quarta",
  quinta = "quinta",
  sexta = "sexta",
  sabado = "sabado",
  domingo = "domingo",
}

export interface IDiaMesAno {
  dia: number;
  mes: number;
  ano: number;
  diaSemana: SemanaEnum;
}

/**
 * OBJ que contém diversos tipos de conversão
 */
export class Converter {
  /**
   * Converte a string de data padrão Sped para Date
   * @example Recebe 30062022 e devolve o tipo Date
   * @returns retorna o Date convertido
   */
  public static dataNotaParaDate(data: string): Date {
    const dia = data.substring(0, 2);
    const mes = data.substring(2, 4);
    const ano = data.substring(4);
    return new Date(`${mes}/${dia}/${ano}`);
  }

  /**
   *Converte uma string com , para number
   * @example string "1,22" para number 1.22
   */
  public static stringComVirgulaParaNumber(texto: string): number {
    return parseFloat(texto.replaceAll(",", "."));
  }

  /**
   * Arrebonda e retira casas decimais além do tamanho
   * @param number é o numero a ser arredondado
   * @param tamanho é a multiplicação a ser adicionada
   * @example tamanho = 100 e num = 10,12321 resulta em 10,12
   * @exampletamanho = 100 e num = 12.21921 resulta em 12.22
   */
  public static arredondaCasasDecimais(num: number, tamanho = 100): number {
    return Math.round(num * tamanho) / tamanho;
  }

  /**
   * Converter um número em uma string padrão com duas casas depois da virgula
   * @example 1.213123 para "1,21"
   * @param number um numero
   */
  public static numParaStringDuasCasas(number: number): string {
    return this.arredondaCasasDecimais(number).toString().replace(".", ",");
  }

  /**
   * Converte o número em uma string com duas casas depois da virgula
   * @example 12.1 para "12,10"
   * @example 5 para "5,00"
   * @example 12.2191 para "12,22"
   * @param number Número
   */
  public static padraoReal(number: number): string {
    const text = this.numParaStringDuasCasas(number || 0);

    if (text.indexOf(",") != -1) {
      if ((text.split(",").pop() as string).length == 1) return `${text}0`;
    } else {
      return `${text},00`;
    }
    return text;
  }

  /**
   * Converter o dado tipo Date para string
   * @example 2022-01-21T03:00:00.000Z para "21012022"
   * @example new Date("01012022") para "01012022"
   * @param data Do tipo date
   * @returns  retorna a data ddmmyyyy
   */
  public static dataParaString(data: Date): string {
    return `${this.adicionaZerosEsquerda(
      data.getUTCDate().toString(),
      "00"
    )}${this.adicionaZerosEsquerda(
      (data.getUTCMonth() + 1).toString(),
      "00"
    )}${data.getUTCFullYear().toString()}`;
  }

  /**
   * Converte dia ou mês para o padrão arquivo
   * @example "1" para "01"
   * @param info Data info
   */
  public static padraoDiaMes(info: string): string {
    return info.length == 1 ? `0${info}` : info;
  }

  /**
   * Faz a mesclagem da informação
   * @param info informação a ser mesclada
   * @param tamanho colocar quantos zeros voce quer "0000"
   */
  public static adicionaZerosEsquerda(info: string, tamanho: string): string {
    return (tamanho + info).slice(tamanho.length * -1);
  }

  /**
   * adicionar zeros a direita
   * @param tamanho zeros que serão adicionados
   */
  public static adicionaZerosDireita(info: string, tamanho: number): string {
    if (info.indexOf(",") == -1) info = `${info},00`;

    const depoisVirgula = info.split(",").pop() as string;

    const diferenca = tamanho - depoisVirgula.length;

    if (diferenca < 0)
      return this.arredondaCasasDecimais(
        parseFloat(info.replaceAll(",", ".")),
        10 ** tamanho
      )
        .toString()
        .replace(".", ",");

    return info.padEnd(info.length + diferenca, "0");
  }

  /**
   * Remove letras da string
   */
  public static removeLetras(info: string): string {
    return info.replaceAll(/[^0-9]/g, "");
  }

  /**
   * UF com base em codigo de cidade
   */
  public static ufComBaseEmCodigoCidade(codigoCidade: string): string {
    if (codigoCidade == "9999999") return "EX";
    const uf = codigoCidade.substring(0, 2);
    if (uf == "00") return "EX";

    switch (uf) {
      case "35":
        return "SP";
      case "15":
        return "AC";
      case "27":
        return "AL";
      case "13":
        return "AM";
      case "29":
        return "BA";
      case "23":
        return "CE";
      case "53":
        return "DF";
      case "32":
        return "ES";
      case "52":
        return "GO";
      case "21":
        return "MA";
      case "51":
        return "MT";
      case "50":
        return "MS";
      case "31":
        return "MG";
      case "41":
        return "PR";
      case "26":
        return "PE";
      case "22":
        return "PI";
      case "33":
        return "RJ";
      case "24":
        return "RN";
      case "43":
        return "RS";
      case "11":
        return "RO";
      case "14":
        return "RR";
      case "42":
        return "SC";
      case "28":
        return "SE";
      case "17":
        return "TO";
    }

    return "SP";
  }

  /**
   * Deixa a string com o tamanho desejado
   * @param data  string a ser cortada
   * @param tamanho  tamanho da string
   * @exemple "1234567890" com tamanho 5 resulta em "67890"
   */
  public static CortaStringAoContrario(data: string, tamanho: number): string {
    return data.substring(data.length - tamanho);
  }

  /**
   * Faz a criação de um tipo Date sem o fuso horário,
   * mas com hora minuto em es zerado
   * @param ano
   * @param mes
   * @param dia
   * @param hora
   * @param minuto
   * @param segundo
   * @returns
   */
  public static criarDate(
    ano?: number,
    mes?: number,
    dia?: number,
    hora?: number,
    minuto?: number,
    segundo?: number
  ): Date {
    const DateLocal = new Date();

    ano = typeof ano == "number" ? ano : DateLocal.getUTCFullYear();
    mes = typeof mes == "number" ? mes : DateLocal.getUTCMonth();
    dia = typeof dia == "number" ? dia : DateLocal.getUTCDate();
    hora = typeof hora == "number" ? hora : 0;
    minuto = typeof minuto == "number" ? minuto : 0;
    segundo = typeof segundo == "number" ? segundo : 1;

    const a = new Date(ano, mes, dia, hora, minuto, segundo);
    const offset = a.getTimezoneOffset();
    const s = new Date(a.getTime() - offset * 60 * 1000);

    return s;
  }

  /**
   * Faz a transformação de um tipo Date em seu primeiro e ultimo segundo do mês
   * @param date Data selecionada para capturar
   * @returns Um objeto com os dados do primeiro segundo e ultimo do mês
   * @example
   *         2022-01-21T03:00:00.000Z
   *         para
   *         #primeiroDia: 2022-01-01T03:00:00.000Z
   *         #ultimoDia: 2022-01-31T03:00:00.000Z
   */
  public static dateParaUltimoEPrimeiroDiaDoMes(
    date: Date
  ): IPrimeiroEUltimoDiaDoMes {
    // Obtenha o ano, mês e dia da data original.
    const ano = date.getUTCFullYear();
    const mes = date.getUTCMonth();

    // Crie uma nova data com o ano, mês e dia obtidos na etapa anterior.
    const primeiroDiaDoMes = this.criarDate(ano, mes, 1, 0, 0, 1);

    const ultimoDiaDoMes = this.criarDate(ano, mes + 1, 0, 23, 59, 59);

    return {
      primeiroDia: primeiroDiaDoMes,
      ultimoDia: ultimoDiaDoMes,
    };
  }

  /**
   * Faz a transformação de um tipo Date em seu primeiro e ultimo segundo do ano
   * @param date Data selecionada para capturar
   * @returns Um objeto com os dados do primeiro e ultimo dia do ano
   * @example
   *         2022-01-21T03:00:00.000Z
   *         para
   *         #primeiroDia: 2022-01-01T03:00:00.000Z
   *         #ultimoDia: 2022-12-31T03:00:00.000Z
   */
  public static dateParaUltimoEPrimeiroDiaDoAno(date: Date): {
    ultimoDia: Date;
    primeiroDia: Date;
    meses: {
      jan: IPrimeiroEUltimoDiaDoMes;
      fev: IPrimeiroEUltimoDiaDoMes;
      mar: IPrimeiroEUltimoDiaDoMes;
      abr: IPrimeiroEUltimoDiaDoMes;
      mai: IPrimeiroEUltimoDiaDoMes;
      jun: IPrimeiroEUltimoDiaDoMes;
      jul: IPrimeiroEUltimoDiaDoMes;
      ago: IPrimeiroEUltimoDiaDoMes;
      set: IPrimeiroEUltimoDiaDoMes;
      out: IPrimeiroEUltimoDiaDoMes;
      nov: IPrimeiroEUltimoDiaDoMes;
      dez: IPrimeiroEUltimoDiaDoMes;
    };
  } {
    // Obtenha o ano, mês e dia da data original.
    const ano = date.getUTCFullYear();
    // const mes = date.getUTCMonth();

    // Crie uma nova data com o ano, mês e dia obtidos na etapa anterior.
    const primeiroDiaDoAno = this.criarDate(ano, 0, 1, 0, 0, 1);

    const ultimoDiaDoAno = this.criarDate(ano + 1, 0, -1, 20, 59, 59);

    const meses = {
      jan: this.dateParaUltimoEPrimeiroDiaDoMes(this.criarDate(ano, 0, 15)),
      fev: this.dateParaUltimoEPrimeiroDiaDoMes(this.criarDate(ano, 1, 15)),
      mar: this.dateParaUltimoEPrimeiroDiaDoMes(this.criarDate(ano, 2, 15)),
      abr: this.dateParaUltimoEPrimeiroDiaDoMes(this.criarDate(ano, 3, 15)),
      mai: this.dateParaUltimoEPrimeiroDiaDoMes(this.criarDate(ano, 4, 15)),
      jun: this.dateParaUltimoEPrimeiroDiaDoMes(this.criarDate(ano, 5, 15)),
      jul: this.dateParaUltimoEPrimeiroDiaDoMes(this.criarDate(ano, 6, 15)),
      ago: this.dateParaUltimoEPrimeiroDiaDoMes(this.criarDate(ano, 7, 15)),
      set: this.dateParaUltimoEPrimeiroDiaDoMes(this.criarDate(ano, 8, 15)),
      out: this.dateParaUltimoEPrimeiroDiaDoMes(this.criarDate(ano, 9, 15)),
      nov: this.dateParaUltimoEPrimeiroDiaDoMes(this.criarDate(ano, 10, 15)),
      dez: this.dateParaUltimoEPrimeiroDiaDoMes(this.criarDate(ano, 11, 15)),
    };

    return {
      primeiroDia: primeiroDiaDoAno,
      ultimoDia: ultimoDiaDoAno,
      meses,
    };
  }

  /**
   * Faz a busca do dia da semana Atual
   * @returns
   */
  public static diaSemana(diaInput?: Date): SemanaEnum {
    const data = diaInput ? diaInput : this.criarDate();
    const dia = data.getUTCDay();

    switch (dia) {
      case 0:
        return SemanaEnum.domingo;
      case 1:
        return SemanaEnum.segunda;
      case 2:
        return SemanaEnum.terca;
      case 3:
        return SemanaEnum.quarta;
      case 4:
        return SemanaEnum.quinta;
      case 5:
        return SemanaEnum.sexta;
      case 6:
        return SemanaEnum.sabado;
    }

    throw new Error("Dia da semana não encontrado");
  }

  /**
   * Faz a busca dos proximos dias do mês atual contando os proximos
   */
  public static proximosDiasDoMes(
    quantidadeDias: number,
    data?: Date
  ): IDiaMesAno[] {
    const dia1 = data ? data : this.criarDate();

    const dias: IDiaMesAno[] = [
      {
        dia: dia1.getUTCDate(),
        mes: dia1.getUTCMonth() + 1,
        ano: dia1.getUTCFullYear(),
        diaSemana: this.diaSemana(dia1),
      },
    ];

    let a = 0;
    while (a < quantidadeDias - 1) {
      dia1.setUTCDate(dia1.getUTCDate() + 1);
      dias.push({
        dia: dia1.getUTCDate(),
        mes: dia1.getUTCMonth() + 1,
        ano: dia1.getUTCFullYear(),
        diaSemana: this.diaSemana(dia1),
      });
      a++;
    }

    return dias;
  }

  /**
   * Faz a conversão de um tipo Date para YYYY-MM-DD
   * @param data Tipo Data
   * @example 2022-01-21T03:00:00.000Z para "2022-01-21"
   */
  public static dataParaStringComTracos(data: Date): string {
    return `${data.getUTCFullYear()}-${this.padraoDiaMes(
      (data.getUTCMonth() + 1).toString()
    )}-${this.padraoDiaMes(data.getUTCDate().toString())}`;
  }
}
