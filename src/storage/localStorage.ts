export function readNumberArray(key: string): number[] {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as number[]) : [];
  } catch {
    return [];
  }
}

export function writeNumberArray(key: string, value: number[]): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}
