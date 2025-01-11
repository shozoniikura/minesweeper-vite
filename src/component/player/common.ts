export const uniqArray = (ary: number[]): number[] => {
  return Array.from(new Set(ary));
};

export const sortedUniqArray = (ary: number[]): number[] => {
  return uniqArray(ary).sort((first, second) => first - second);
};

export const tileElements = (): NodeListOf<HTMLImageElement> => {
  return document.querySelectorAll('div[data-id="board"] img');
};

export const getValueAt = (node: HTMLImageElement): number => {
  return parseInt(node.getAttribute("data-tile") || '0');
}

export const getStatus = (): number => {
  const st: string = document.querySelector('img[data-name="smile"]')?.getAttribute('data-game-status') || '0';
  return parseInt(st);
};

