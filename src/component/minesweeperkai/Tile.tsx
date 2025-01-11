/************************************************
 * Tile Component
 ************************************************/

interface TileProp {
  src: string,   // imgタグのsrcに入れるurl
  index: number, // ゲーム版上のindex
  leftClick: (i: number) => void,
  rightClick: (e: React.MouseEvent<HTMLImageElement>, i: number) => void,
  doubleClick: (e: React.MouseEvent<HTMLImageElement>, i: number) => void,
  tileValue: number,
}

export default function Tile(
  { src, index, tileValue, leftClick, rightClick, doubleClick }: TileProp
) {
  return (
    <img
      style={{ margin: 0, padding: 0, userSelect: "none" }} src={src}
      onClick={() => leftClick(index)}
      onContextMenu={(e) => rightClick(e, index)}
      onDoubleClick={(e) => doubleClick(e, index)}
      data-tile={tileValue}
      alt={tileValue.toString()}
    >
    </img>
  );
}
