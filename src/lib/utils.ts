export let unique = (arr: any[]) => [...new Set(arr)];

export let trim0decimals = (num: number) => num.toFixed() === num.toString() ? num.toFixed() : num.toString();

