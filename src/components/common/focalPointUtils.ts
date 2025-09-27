


function round(n: number | null, decimals: number = 3): number | undefined {
  if (n === null) return undefined;
  return Number(n.toFixed(decimals));
}



export const toFocalPoint = (
  x?: number,
  y?: number
): { x: number; y: number } | undefined =>
  x !== undefined && y !== undefined ? { x, y } : undefined;



export const fromFocalPoint = (
  point?: { x: number; y: number }
): { focalPointX?: number; focalPointY?: number } =>
  point
    ? {
        focalPointX: round(point.x),
        focalPointY: round(point.y)
      }
    : {};

