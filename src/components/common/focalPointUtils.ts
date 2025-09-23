
export const toFocalPoint = (
  x?: number,
  y?: number
): { x: number; y: number } | undefined =>
  x !== undefined && y !== undefined ? { x, y } : undefined;

const round = (n: number, decimals = 3) =>
  Number(n.toFixed(decimals));


export const fromFocalPoint = (
  point?: { x: number; y: number }
): { focalPointX?: number; focalPointY?: number } =>
  point
    ? {
        focalPointX: round(point.x),
        focalPointY: round(point.y)
      }
    : {};

