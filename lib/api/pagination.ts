import { api, type ApiFetchOptions } from "./client";
import { isRecord } from "./errors";

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous?: string | null;
  results: T[];
};

export function isPaginated<T>(data: T[] | Paginated<T>): data is Paginated<T> {
  return !Array.isArray(data) && isRecord(data) && Array.isArray(data.results);
}

export function toPage<T>(data: T[] | Paginated<T>): Paginated<T> {
  if (isPaginated(data)) return data;
  return { count: data.length, next: null, previous: null, results: data };
}

export async function getPage<T>(path: string, options?: ApiFetchOptions): Promise<Paginated<T>> {
  return toPage(await api.get<T[] | Paginated<T>>(path, options));
}

export async function getAllPages<T>(path: string, options?: ApiFetchOptions): Promise<T[]> {
  const results: T[] = [];
  let next: string | null = path;
  while (next) {
    const page: Paginated<T> = await getPage<T>(next, options);
    results.push(...page.results);
    next = page.next;
  }
  return results;
}
