import NodeCache from "node-cache";

/**
 * Serve para armazenar valores por periodos de tempo determinado,
 * se faço uma requisição de uma informação via API que não vai mudar em
 * X tempo posso armazena-lá em cache, assim evitando consumo excessivo
 */
class CacheUtil {
  constructor(protected cacheService = new NodeCache()) {}

  /**
   * @param key  onde vai ser armazenado
   * @param value O valor a ser passado
   * @param ttl  Tempo em segundos
   * @returns
   */
  public set<T>(key: string, value: T, ttl = 3600): boolean {
    return this.cacheService.set(key, value, ttl);
  }

  /**
   * Recupera informação da cache
   */
  public get<T>(key: string): T | undefined {
    return this.cacheService.get<T>(key);
  }

  /**
   * Faz a limpeza de toda a cache
   */
  public clearAllCache(): void {
    return this.cacheService.flushAll();
  }

  /**
   * Faz a limpeza de uma informação da cache
   */
  public clearOneCache(key: string): number {
    return this.cacheService.del(key);
  }

  /**
   * Faz a renovação do tempo de vida de uma informação
   */
  public renoveTTL(key: string, ttl = 3600): boolean {
    return this.cacheService.ttl(key, ttl);
  }
}

export default new CacheUtil();
