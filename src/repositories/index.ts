// Arquivo de configuração de abstração do Banco de dados
// Serve para se utilizar diversos bancos de dados no mesmo sistema de forma que eles não se atrapalhem
// Bloqueando erros de bibliotecas subirem para outros ambientes

import { TokenUser, User, UserDepoisToObject } from "@src/model/user";

import {
  LogError,
  LogErrorDepoisToObject,
  LogErrosAgrupadosPorCode,
} from "@src/model/logError";
import { JWTGeradoInterface } from "@src/services/authService";
import { PopulateOptions } from "mongoose";

export type FilterOptions = Record<string, unknown>;

export type AttData = Record<string, unknown>;

/**
 * Options para populatar as informações
 * @param path campo que será populado
 * @param campos campos que serão populados
 * @param populate populado de forma recursiva podendo popular mais de um campo
 */
export interface PopulateOptionsPersonalizado extends PopulateOptions {}

/**
 * Base para todos os Repositorios
 */
export interface BaseRepository<T, K> {
  /**
   * Faz a criação no banco de dados
   * @param data informação a ser salva
   */
  create(data: Partial<T>): Promise<K>;
  /**
   * Faz a busca da informação com base nos parametros passados,
   * a informação pelo populate tem que ser ajustada diretamente no Schema do model
   * para não quebrar o sistema
   * @param options Options para Query localizar
   * @param populate Options para Query localizar com populate
   */
  findOne<I = K>(
    options: FilterOptions,
    populate?: PopulateOptionsPersonalizado
  ): Promise<I | null>;

  /**
   * Faz a busca de uma informação com base no ip passado
   * @param id para localização da informação
   */
  findById<I = K>(
    id: string,
    populate?: PopulateOptionsPersonalizado
  ): Promise<I | null>;

  /**
   * Faz a busca de informações no banco de dados
   * @param options Opções que serão buscadas
   */
  find<I = K>(
    options: FilterOptions,
    populate?: PopulateOptionsPersonalizado[]
  ): Promise<I[]>;

  /**
   * Deleta varias informações ao mesmo tempo
   * @param option Opções que serão deletados
   */
  deleteMany(options: FilterOptions): Promise<number>;

  /**
   * Deleta um unico alvo
   * @param options objetivo que vai ser deletado
   */
  deleteOne(options: FilterOptions): Promise<number>;

  /**
   * Faz a atualização de informações de um unico ID
   * @param id do dados que será atualizado
   * @param dado dados que serão atualizados
   */
  updateById(id: string, att: AttData): Promise<boolean>;

  /**
   * Faz a verificação se informação existe no banco de dados
   * @param options Options para Query localizar
   */
  existe(options: FilterOptions): Promise<boolean>;
}

/**
 * User Repository
 */
export interface UserRepository
  extends BaseRepository<User, UserDepoisToObject> {
  /**
   * Faz a comparação da senha
   * @param email
   * @param password
   */
  comparaSenha(
    email: string,
    password: string
  ): Promise<UserDepoisToObject | undefined>;
  /**
   * Adiciona o JWT no banco de dados
   * @param id id do usuario
   * @param jwt objeto com o jwt e o tempo de expiração
   * @param ip ip do usuario
   * @param ativo se o jwt está ativo ou não
   * @returns
   */
  adicionarJWTs(
    id: string,
    jwt: JWTGeradoInterface,
    ip: string
  ): Promise<boolean>;

  /**
   * Seta o token de recuperação de senha no banco de dados
   * @param id id do usuario
   * @param token token de recuperação de senha
   * @param expiraEm tempo de expiração do token
   */
  setTokenRecuperacaoSenha(
    id: string,
    token: string,
    expiraEm: Date
  ): Promise<TokenUser>;
  /**
   * Faz a verificação se o token existe no banco de dados e se está valido para uso
   * @param token
   */
  existsTokenReset(token: string): Promise<boolean>;

  /**
   * Seta o token de confirmação de email no DB
   * @param id  User_id
   * @param token  token de confirmação
   * @param expiraEm tempo maximmo para confirmação
   */
  setaTokenConfirmacaoEmail(
    id: string,
    token: string,
    expiraEm: Date
  ): Promise<boolean>;

  /**
   * Faz a verificação se o token de confirmação de email existe no banco de dados
   * @param token
   */
  existsTokenConfirmacaoEmail(token: string): Promise<string | undefined>;
}

/**
 * LogError Repository
 */
export interface LogErrorRepository
  extends BaseRepository<LogError, LogErrorDepoisToObject> {
  /**
   * Agrupo os erros por code
   */
  agruparPorCode(filtro: FilterOptions): Promise<LogErrosAgrupadosPorCode[]>;
}
