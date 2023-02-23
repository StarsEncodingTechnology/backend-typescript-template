import { connect as mongooseConnect, connection, set } from "mongoose";
import logger from "./logger";

// seta o modo de conexão com o banco de dados
set("strictQuery", true);

/**
 * Faz a conexão com o banco de dados
 * @param urlDB  Tem como padrão buscar na .env
 */
export const connect = async (
  urlDB: string = process.env.MONGOURL as string
): Promise<void> => {
  // conectado o server com o DB

  await mongooseConnect(urlDB);
  if (process.env.NODE_ENV != "test") logger.info("Conectado ao banco");
};

/**
 * Faz a desconexão do banco de dados
 */
export const close = (): Promise<void> => connection.close();
// faz a desconexão do sistema
