export const uniqArray = (ary: number[]): number[] => {
  return Array.from(new Set(ary));
};

export const sortedUniqArray = (ary: number[]): number[] => {
  return uniqArray(ary).sort((first, second) => first - second);
};
