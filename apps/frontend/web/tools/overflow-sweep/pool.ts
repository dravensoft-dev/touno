export async function inPool<T, R>(
  items: readonly T[],
  workers: number,
  run: (item: T, at: number) => Promise<R>,
): Promise<readonly R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  const worker = async (): Promise<void> => {
    for (let at = next++; at < items.length; at = next++) {
      results[at] = await run(items[at] as T, at);
    }
  };

  await Promise.all(Array.from({ length: Math.max(1, Math.min(workers, items.length)) }, worker));

  return results;
}
