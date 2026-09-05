import { Point, BrushSettings } from '../types';

/**
 * High-performance Brush Engine
 * Implements digital, organic, and physical media brush styles with jitter and rotation.
 * All functions are enclosed in try-catch blocks for strict stability.
 */

export function renderBrushSegment(
  ctx: CanvasRenderingContext2D,
  seg: Point[],
  brushSettings: BrushSettings
): void {
  try {
    if (!seg || seg.length === 0) return;

    const baseColor = brushSettings.strokeColor || '#000000';
    const baseWidth = Math.max(1, brushSettings.strokeWidth || 3.5);
    const brushType = brushSettings.brushType || 'solid';
    const opacity = brushSettings.strokeOpacity ?? 1.0;
    const hasJitter = !!(brushSettings.jitterEnabled || brushSettings.rotationJitter || brushSettings.sizeJitter);
    const jitterStrength = brushSettings.jitterAmount ?? 0.5;

    ctx.save();

    // Configure Shadows
    if (brushSettings.shadowEnabled) {
      ctx.shadowColor = brushSettings.shadowColor || '#000000';
      ctx.shadowBlur = brushSettings.shadowBlur || 4;
      ctx.shadowOffsetX = brushSettings.shadowOffsetX || 2;
      ctx.shadowOffsetY = brushSettings.shadowOffsetY || 2;
    }

    ctx.globalAlpha = Math.max(0, Math.min(1, (ctx.globalAlpha || 1) * opacity));

    if (brushType === 'calligraphy') {
      // Calligraphy Chisel Nib
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = Math.max(1, baseWidth * 0.4);
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';
      const angle = ((brushSettings.chiselAngle ?? 45) * Math.PI) / 180;
      const dx = Math.cos(angle) * (baseWidth * 0.8);
      const dy = Math.sin(angle) * (baseWidth * 0.8);

      for (let i = 0; i < seg.length; i++) {
        let curDx = dx;
        let curDy = dy;
        if (hasJitter) {
          const rotJitter = brushSettings.rotationJitter ? (Math.random() - 0.5) * 0.4 * jitterStrength : 0;
          const szJitter = brushSettings.sizeJitter ? 1 + (Math.random() - 0.5) * 0.15 * jitterStrength : 1;
          curDx = (Math.cos(angle + rotJitter) * (baseWidth * 0.8)) * szJitter;
          curDy = (Math.sin(angle + rotJitter) * (baseWidth * 0.8)) * szJitter;
        }
        ctx.beginPath();
        ctx.moveTo(seg[i].x - curDx, seg[i].y - curDy);
        ctx.lineTo(seg[i].x + curDx, seg[i].y + curDy);
        ctx.stroke();
      }
    } else if (brushType === 'pencil') {
      // Textured Charcoal / Graphite Pencil
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = Math.max(0.5, baseWidth * 0.7);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      if (seg.length === 1) {
        ctx.arc(seg[0].x, seg[0].y, baseWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < seg.length; i++) {
          const xc = (seg[i].x + seg[i - 1].x) / 2;
          const yc = (seg[i].y + seg[i - 1].y) / 2;
          ctx.quadraticCurveTo(seg[i - 1].x, seg[i - 1].y, xc, yc);
        }
        ctx.lineTo(seg[seg.length - 1].x, seg[seg.length - 1].y);
        ctx.stroke();
      }

      // Graphite Grain Sprinkles
      ctx.fillStyle = baseColor;
      const grainCount = Math.min(8, Math.max(2, Math.floor(baseWidth * 0.4)));
      for (let i = 0; i < seg.length; i++) {
        for (let k = 0; k < grainCount; k++) {
          const spread = (baseWidth * 0.5) * (hasJitter ? (1 + Math.random() * 0.3) : 1);
          const gx = seg[i].x + (Math.random() - 0.5) * spread;
          const gy = seg[i].y + (Math.random() - 0.5) * spread;
          ctx.fillRect(gx, gy, 1, 1);
        }
      }
    } else if (brushType === 'marker') {
      // Translucent Marker / Highlighter
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = baseWidth * 1.2;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
      ctx.globalAlpha = Math.min(1, ctx.globalAlpha * 0.6);
      ctx.beginPath();
      if (seg.length === 1) {
        ctx.fillRect(seg[0].x - baseWidth / 2, seg[0].y - baseWidth / 2, baseWidth, baseWidth);
      } else {
        ctx.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < seg.length; i++) {
          const xc = (seg[i].x + seg[i - 1].x) / 2;
          const yc = (seg[i].y + seg[i - 1].y) / 2;
          ctx.quadraticCurveTo(seg[i - 1].x, seg[i - 1].y, xc, yc);
        }
        ctx.lineTo(seg[seg.length - 1].x, seg[seg.length - 1].y);
        ctx.stroke();
      }
    } else if (brushType === 'airbrush') {
      // Soft Airbrush Spray
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = baseWidth * 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.filter = `blur(${Math.max(2, baseWidth * 0.3)}px)`;
      ctx.beginPath();
      if (seg.length === 1) {
        ctx.arc(seg[0].x, seg[0].y, baseWidth, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
      } else {
        ctx.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < seg.length; i++) {
          const xc = (seg[i].x + seg[i - 1].x) / 2;
          const yc = (seg[i].y + seg[i - 1].y) / 2;
          ctx.quadraticCurveTo(seg[i - 1].x, seg[i - 1].y, xc, yc);
        }
        ctx.lineTo(seg[seg.length - 1].x, seg[seg.length - 1].y);
        ctx.stroke();
      }
    } else if (brushType === 'glow') {
      // Neon Glow Aura
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = baseWidth * 1.3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = Math.max(12, baseWidth * 2.5);
      ctx.beginPath();
      if (seg.length === 1) {
        ctx.arc(seg[0].x, seg[0].y, baseWidth, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
      } else {
        ctx.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < seg.length; i++) {
          const xc = (seg[i].x + seg[i - 1].x) / 2;
          const yc = (seg[i].y + seg[i - 1].y) / 2;
          ctx.quadraticCurveTo(seg[i - 1].x, seg[i - 1].y, xc, yc);
        }
        ctx.lineTo(seg[seg.length - 1].x, seg[seg.length - 1].y);
        ctx.stroke();
      }
    } else if (brushType === 'water') {
      // Watercolor Wet Blend with pigment accumulation at edges
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = baseWidth * 1.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = Math.min(1, ctx.globalAlpha * 0.45);
      ctx.beginPath();
      if (seg.length === 1) {
        ctx.arc(seg[0].x, seg[0].y, baseWidth * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
      } else {
        ctx.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < seg.length; i++) {
          const xc = (seg[i].x + seg[i - 1].x) / 2;
          const yc = (seg[i].y + seg[i - 1].y) / 2;
          ctx.quadraticCurveTo(seg[i - 1].x, seg[i - 1].y, xc, yc);
        }
        ctx.lineTo(seg[seg.length - 1].x, seg[seg.length - 1].y);
        ctx.stroke();
      }

      // Inner wet core
      ctx.globalAlpha = Math.min(1, ctx.globalAlpha * 0.7);
      ctx.lineWidth = baseWidth * 0.7;
      ctx.stroke();
    } else if (brushType === 'dry') {
      // Dry Brush / Chalk Bristle
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = Math.max(1, baseWidth * 0.8);
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'round';

      for (let i = 1; i < seg.length; i++) {
        const p1 = seg[i - 1];
        const p2 = seg[i];
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const steps = Math.max(2, Math.floor(dist / 3));

        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const cx = p1.x + (p2.x - p1.x) * t;
          const cy = p1.y + (p2.y - p1.y) * t;

          // Multiple bristle filaments
          const bristleCount = 4;
          for (let b = 0; b < bristleCount; b++) {
            if (Math.random() > 0.25) { // dry skips
              const offset = ((b - bristleCount / 2) / bristleCount) * baseWidth;
              const rot = hasJitter && brushSettings.rotationJitter ? (Math.random() - 0.5) * 0.5 : 0;
              const bx = cx + Math.cos(angle + Math.PI / 2 + rot) * offset;
              const by = cy + Math.sin(angle + Math.PI / 2 + rot) * offset;
              ctx.fillStyle = baseColor;
              const sz = hasJitter && brushSettings.sizeJitter ? Math.max(0.5, (1 + (Math.random() - 0.5) * 0.2) * 1.5) : 1.5;
              ctx.fillRect(bx, by, sz, sz);
            }
          }
        }
      }
    } else if (brushType === 'cold') {
      // Cold / Frost Crystalline Line
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = baseWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#93c5fd';
      ctx.shadowBlur = Math.max(4, baseWidth);
      ctx.beginPath();
      if (seg.length === 1) {
        ctx.arc(seg[0].x, seg[0].y, baseWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
      } else {
        ctx.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < seg.length; i++) {
          const xc = (seg[i].x + seg[i - 1].x) / 2;
          const yc = (seg[i].y + seg[i - 1].y) / 2;
          ctx.quadraticCurveTo(seg[i - 1].x, seg[i - 1].y, xc, yc);
        }
        ctx.lineTo(seg[seg.length - 1].x, seg[seg.length - 1].y);
        ctx.stroke();
      }
    } else if (brushType === 'smooth') {
      // Super Smooth Streamline Vector
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = baseWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      if (seg.length === 1) {
        ctx.arc(seg[0].x, seg[0].y, baseWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
      } else {
        ctx.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < seg.length; i++) {
          const xc = (seg[i].x + seg[i - 1].x) / 2;
          const yc = (seg[i].y + seg[i - 1].y) / 2;
          ctx.quadraticCurveTo(seg[i - 1].x, seg[i - 1].y, xc, yc);
        }
        ctx.lineTo(seg[seg.length - 1].x, seg[seg.length - 1].y);
        ctx.stroke();
      }
    } else if (brushType === 'charcoal') {
      // Organic Rough Charcoal
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = baseWidth * 1.1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = Math.min(1, ctx.globalAlpha * 0.85);

      ctx.beginPath();
      if (seg.length === 1) {
        ctx.arc(seg[0].x, seg[0].y, baseWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
      } else {
        ctx.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < seg.length; i++) {
          const jitterX = hasJitter ? (Math.random() - 0.5) * 1.5 * jitterStrength : 0;
          const jitterY = hasJitter ? (Math.random() - 0.5) * 1.5 * jitterStrength : 0;
          const xc = (seg[i].x + seg[i - 1].x) / 2 + jitterX;
          const yc = (seg[i].y + seg[i - 1].y) / 2 + jitterY;
          ctx.quadraticCurveTo(seg[i - 1].x, seg[i - 1].y, xc, yc);
        }
        ctx.lineTo(seg[seg.length - 1].x, seg[seg.length - 1].y);
        ctx.stroke();
      }
    } else if (brushType === 'oil') {
      // Thick Oil Paint with Bristle Ridges
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = baseWidth * 1.25;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      if (seg.length === 1) {
        ctx.arc(seg[0].x, seg[0].y, baseWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
      } else {
        ctx.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < seg.length; i++) {
          const xc = (seg[i].x + seg[i - 1].x) / 2;
          const yc = (seg[i].y + seg[i - 1].y) / 2;
          ctx.quadraticCurveTo(seg[i - 1].x, seg[i - 1].y, xc, yc);
        }
        ctx.lineTo(seg[seg.length - 1].x, seg[seg.length - 1].y);
        ctx.stroke();
      }

      // Oil Glaze highlight
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = Math.min(1, ctx.globalAlpha * 0.25);
      ctx.lineWidth = Math.max(1, baseWidth * 0.3);
      ctx.beginPath();
      if (seg.length > 1) {
        ctx.moveTo(seg[0].x - 1, seg[0].y - 1);
        for (let i = 1; i < seg.length; i++) {
          const xc = (seg[i].x + seg[i - 1].x) / 2 - 1;
          const yc = (seg[i].y + seg[i - 1].y) / 2 - 1;
          ctx.quadraticCurveTo(seg[i - 1].x - 1, seg[i - 1].y - 1, xc, yc);
        }
        ctx.stroke();
      }
      ctx.restore();
    } else if (brushType === 'ink') {
      // Japanese Sumi-e / Fountain Pen Ink
      ctx.strokeStyle = baseColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 1; i < seg.length; i++) {
        const p1 = seg[i - 1];
        const p2 = seg[i];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        // Speed thinning: faster strokes are thinner
        const speed = Math.min(10, Math.max(1, dist));
        let curWidth = Math.max(1, baseWidth * (1.2 - speed * 0.05));
        if (hasJitter && brushSettings.sizeJitter) {
          curWidth *= (1 + (Math.random() - 0.5) * 0.15 * jitterStrength);
        }
        ctx.lineWidth = curWidth;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    } else {
      // Solid Monoline Vector Brush (with optional Stamp Jitter)
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = baseWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      if (seg.length === 1) {
        ctx.arc(seg[0].x, seg[0].y, baseWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
      } else {
        ctx.moveTo(seg[0].x, seg[0].y);
        for (let i = 1; i < seg.length; i++) {
          let xc = (seg[i].x + seg[i - 1].x) / 2;
          let yc = (seg[i].y + seg[i - 1].y) / 2;
          if (hasJitter && brushSettings.rotationJitter) {
            const rot = (Math.random() - 0.5) * Math.PI * 2 * jitterStrength * 0.1;
            xc += Math.cos(rot) * 0.5;
            yc += Math.sin(rot) * 0.5;
          }
          ctx.quadraticCurveTo(seg[i - 1].x, seg[i - 1].y, xc, yc);
        }
        ctx.lineTo(seg[seg.length - 1].x, seg[seg.length - 1].y);
        ctx.stroke();
      }
    }

    ctx.restore();
  } catch (err: any) {
    console.error('renderBrushSegment error:', err);
    ctx.restore();
  }
}
