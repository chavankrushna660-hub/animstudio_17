import { Point, BezierAnchor, BezierToolState, VectorObject } from '../types';
import { distance } from './math';

/**
 * Vector Pen & Bézier Curve Engine
 * Implements the 4 anatomical parts:
 * 1. Anchor Points (square boxes)
 * 2. Elastic Curve Path
 * 3. Direction Handles (connecting arm)
 * 4. Direction Points (control handle end dots)
 * All enclosed in try-catch blocks.
 */

export function evaluateCubicBezier(
  p0: Point,
  cp1: Point,
  cp2: Point,
  p1: Point,
  steps: number = 20
): Point[] {
  try {
    const pts: Point[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const x =
        mt * mt * mt * p0.x +
        3 * mt * mt * t * cp1.x +
        3 * mt * t * t * cp2.x +
        t * t * t * p1.x;
      const y =
        mt * mt * mt * p0.y +
        3 * mt * mt * t * cp1.y +
        3 * mt * t * t * cp2.y +
        t * t * t * p1.y;
      pts.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
    }
    return pts;
  } catch (err: any) {
    console.error('evaluateCubicBezier error:', err);
    return [p0, p1];
  }
}

export function convertAnchorsToVectorPoints(anchors: BezierAnchor[], isClosed: boolean = false): Point[] {
  try {
    if (!anchors || anchors.length === 0) return [];
    if (anchors.length === 1) return [{ x: anchors[0].x, y: anchors[0].y }];

    const result: Point[] = [];
    const count = isClosed ? anchors.length : anchors.length - 1;

    for (let i = 0; i < count; i++) {
      const a1 = anchors[i];
      const a2 = anchors[(i + 1) % anchors.length];

      const p0 = { x: a1.x, y: a1.y };
      const cp1 = a1.handleOut || { x: a1.x, y: a1.y };
      const cp2 = a2.handleIn || { x: a2.x, y: a2.y };
      const p1 = { x: a2.x, y: a2.y };

      const seg = evaluateCubicBezier(p0, cp1, cp2, p1, 16);
      if (i > 0) seg.shift(); // avoid duplicate start point
      result.push(...seg);
    }

    return result;
  } catch (err: any) {
    console.error('convertAnchorsToVectorPoints error:', err);
    return anchors.map(a => ({ x: a.x, y: a.y }));
  }
}

export function drawBezierOverlay(
  ctx: CanvasRenderingContext2D,
  anchors: BezierAnchor[],
  selectedIdx: number | null,
  isClosed: boolean = false,
  zoomScale: number = 1
): void {
  try {
    if (!anchors || anchors.length === 0) return;

    ctx.save();
    const invScale = 1 / Math.max(0.2, zoomScale);

    // 1. Draw Elastic Curve Path
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = Math.max(1.5, 2.5 * invScale);
    ctx.beginPath();
    const curvePoints = convertAnchorsToVectorPoints(anchors, isClosed);
    if (curvePoints.length > 1) {
      ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
      for (let i = 1; i < curvePoints.length; i++) {
        ctx.lineTo(curvePoints[i].x, curvePoints[i].y);
      }
      ctx.stroke();
    }

    // 2. Draw Direction Handles & Direction Points for all or selected anchors
    anchors.forEach((a, idx) => {
      const isSelected = idx === selectedIdx;

      // Handle In
      if (a.handleIn) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = Math.max(1, 1.5 * invScale);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.handleIn.x, a.handleIn.y);
        ctx.stroke();

        // Direction Point Dot
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(a.handleIn.x, a.handleIn.y, Math.max(3, 4.5 * invScale), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(0.8, 1 * invScale);
        ctx.stroke();
      }

      // Handle Out
      if (a.handleOut) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = Math.max(1, 1.5 * invScale);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.handleOut.x, a.handleOut.y);
        ctx.stroke();

        // Direction Point Dot
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(a.handleOut.x, a.handleOut.y, Math.max(3, 4.5 * invScale), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(0.8, 1 * invScale);
        ctx.stroke();
      }

      // 3. Anchor Point (Square Box)
      const boxSize = Math.max(6, 9 * invScale);
      ctx.fillStyle = isSelected ? '#38bdf8' : (a.isCorner ? '#ef4444' : '#ffffff');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(1, 1.5 * invScale);
      ctx.fillRect(a.x - boxSize / 2, a.y - boxSize / 2, boxSize, boxSize);
      ctx.strokeRect(a.x - boxSize / 2, a.y - boxSize / 2, boxSize, boxSize);
    });

    ctx.restore();
  } catch (err: any) {
    console.error('drawBezierOverlay error:', err);
    ctx.restore();
  }
}
