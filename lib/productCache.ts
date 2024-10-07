import { get, set } from 'idb-keyval';

const CACHE_KEY = 'productsCache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CachedData {
  timestamp: number;
  data: any;
}

export async function getCachedProducts() {
  const cachedData: CachedData | undefined = await get(CACHE_KEY);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
    return cachedData.data;
  }
  return null;
}

export async function setCachedProducts(products: any) {
  const cacheData: CachedData = {
    timestamp: Date.now(),
    data: products,
  };
  await set(CACHE_KEY, cacheData);
}

export async function invalidateProductCache() {
  await set(CACHE_KEY, null);
}