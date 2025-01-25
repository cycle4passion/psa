export const unique = (arr: unknown[]) => [...new Set(arr)];

export const trim0decimals = (num: number) => num.toFixed() === num.toString() ? num.toFixed() : num.toString();

