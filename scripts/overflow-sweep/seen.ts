export class SeenPages {
  private readonly first = new Map<string, string>();

  private repeated = 0;

  get size(): number {
    return this.first.size;
  }

  get repeats(): number {
    return this.repeated;
  }

  claim(signature: string, where: string): string | undefined {
    const earlier = this.first.get(signature);

    if (earlier !== undefined) {
      this.repeated++;

      return earlier;
    }

    this.first.set(signature, where);

    return undefined;
  }
}
