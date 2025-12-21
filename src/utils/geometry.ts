import type { Point } from '@/types/tool';

/**
 * ベジェ曲線の制御点を計算（スムージング用）
 */
export function getQuadraticControlPoint(p0: Point, p1: Point, p2: Point, t: number = 0.5): Point {
  return {
    x: p1.x + (p2.x - p0.x) * t,
    y: p1.y + (p2.y - p0.y) * t,
  };
}

/**
 * 点の配列から滑らかな曲線を描画するためのパスを生成
 */
export function generateSmoothPath(points: Point[]): { start: Point; curves: { cp: Point; end: Point }[] } | null {
  if (points.length < 2) return null;

  const start = points[0];
  const curves: { cp: Point; end: Point }[] = [];

  for (let i = 1; i < points.length - 1; i++) {
    const cp = getQuadraticControlPoint(points[i - 1], points[i], points[i + 1]);
    curves.push({ cp, end: points[i] });
  }

  // 最後の点
  if (points.length > 1) {
    const lastPoint = points[points.length - 1];
    const secondLastPoint = points[points.length - 2];
    curves.push({ cp: secondLastPoint, end: lastPoint });
  }

  return { start, curves };
}

/**
 * 矢印の頭部の三角形の頂点を計算
 */
export function getArrowHeadPoints(start: Point, end: Point, headSize: number): Point[] {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const arrowAngle = Math.PI / 6; // 30度

  const point1: Point = {
    x: end.x - headSize * Math.cos(angle - arrowAngle),
    y: end.y - headSize * Math.sin(angle - arrowAngle),
  };

  const point2: Point = {
    x: end.x - headSize * Math.cos(angle + arrowAngle),
    y: end.y - headSize * Math.sin(angle + arrowAngle),
  };

  return [point1, end, point2];
}

/**
 * 2つの矩形が重なっているかチェック
 */
export function rectanglesIntersect(
  r1: { x: number; y: number; width: number; height: number },
  r2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    r1.x + r1.width < r2.x ||
    r2.x + r2.width < r1.x ||
    r1.y + r1.height < r2.y ||
    r2.y + r2.height < r1.y
  );
}

/**
 * 点が矩形内にあるかチェック
 */
export function pointInRectangle(
  point: Point,
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}
