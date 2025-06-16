import logger from "./logger";

type InternalStoreValue = {
  [key: string]: unknown;
  createdAtInMilliseconds: number;
};

type ExternalStoreValue = Record<string, unknown>;

export default class Cache {
  maxAge: number;
  store: Map<string, InternalStoreValue>;

  constructor(maxAge: number) {
    this.maxAge = maxAge;
    this.store = new Map<string, InternalStoreValue>();
  }

  get(key: string): ExternalStoreValue | undefined {
    if (this.store.has(key) === false) {
      logger.debug("key not found in cache");
      return;
    }

    const { createdAtInMilliseconds, ...originalValue } = this.store.get(
      key,
    ) as InternalStoreValue;

    if (this.maxAge > Date.now() - createdAtInMilliseconds) {
      logger.debug("key found in cache");
      return originalValue;
    } else {
      logger.debug("key is expired");
      this.store.delete(key);
    }
  }

  set(key: string, value: ExternalStoreValue) {
    this.store.set(key, {
      ...value,
      createdAtInMilliseconds: Date.now(),
    });
  }
}
