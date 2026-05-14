/// <reference types="vite/client" />

const config = import.meta.env;

export function getConfig(key: `VITE_${string}`): string | undefined {
  const value = config[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
