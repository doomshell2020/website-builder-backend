// src/utils/cache.util.ts
import Keyv from 'keyv';

const keyv = new Keyv();

export const set = (key: string, value: any, ttl?: number): Promise<boolean> => {
  return keyv.set(key, value, ttl);
};

export const get = (key: string): Promise<any> => {
  return keyv.get(key);
};

export const del = (key: string): Promise<boolean> => {
  return keyv.delete(key);
};

export const clear = (): Promise<void> => {
  return keyv.clear();
};
