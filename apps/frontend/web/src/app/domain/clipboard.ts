export async function copyText(value: string): Promise<boolean> {
  const clipboard = globalThis.navigator?.clipboard;

  if (!clipboard) {
    return false;
  }

  try {
    await clipboard.writeText(value);

    return true;
  } catch {
    return false;
  }
}
