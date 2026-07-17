/**
 * Premium tarot card texture generator.
 * Black dominant + gold accent aesthetic.
 */

function drawOrnamentalCorner(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  corner: 'tl' | 'tr' | 'bl' | 'br',
) {
  const sx = corner === 'tr' || corner === 'br' ? -1 : 1;
  const sy = corner === 'bl' || corner === 'br' ? -1 : 1;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#C8A040';
  ctx.beginPath();
  ctx.moveTo(x + sx * size, y + sy * size * 0.25);
  ctx.lineTo(x + sx * size, y);
  ctx.lineTo(x + sx * size * 0.25, y);
  ctx.stroke();
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(x + sx * (size - 10), y + sy * size * 0.2);
  ctx.lineTo(x + sx * (size - 10), y + sy * 8);
  ctx.lineTo(x + sx * size * 0.2, y + sy * 8);
  ctx.stroke();
  ctx.fillStyle = '#C8A040';
  ctx.beginPath();
  ctx.arc(x + sx * (size - 4), y + sy * (size - 4), 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawFiligree(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, radius: number, petals: number,
) {
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = '#A08030';
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    const x = cx + Math.cos(a) * radius;
    const y = cy + Math.sin(a) * radius;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    const a2 = a + Math.PI / petals;
    const bx = cx + Math.cos(a2) * radius * 0.5;
    const by = cy + Math.sin(a2) * radius * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cx, cy, bx, by);
    ctx.stroke();
  }
}

function drawStarShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, ir: number, or: number, pts: number) {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 === 0 ? or : ir;
    const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawDarkCorner(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  corner: 'tl' | 'tr' | 'bl' | 'br',
) {
  const sx = corner === 'tr' || corner === 'br' ? -1 : 1;
  const sy = corner === 'bl' || corner === 'br' ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(x + sx * size, y + sy * size * 0.25);
  ctx.lineTo(x + sx * size, y);
  ctx.lineTo(x + sx * size * 0.25, y);
  ctx.stroke();
}

function drawSmallDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s * 0.6, y);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s * 0.6, y);
  ctx.closePath();
  ctx.fill();
}

// ═══════════════════════════════════════════
//  CARD BACK — Pure black, no gold. Embossed dark patterns only.
// ═══════════════════════════════════════════
export function createCardBackTexture(): HTMLCanvasElement {
  const w = 512, h = 768;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;

  // ═══ PURE BLACK BASE ═══
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // Embossed micro texture — dark grey speckle
  ctx.fillStyle = 'rgba(30,30,30,0.03)';
  for (let i = 0; i < 2000; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }

  // ═══ BLACK BORDER — embossed bevel lines (dark grey on black) ═══
  const bd = 32;
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, w, h);
  ctx.clearRect(bd, bd, w - bd * 2, h - bd * 2);

  // Embossed inner line
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  ctx.strokeRect(bd + 3, bd + 3, w - (bd + 3) * 2, h - (bd + 3) * 2);

  // Deeper embossed spacer
  ctx.strokeStyle = '#0a0a0a';
  ctx.lineWidth = 10;
  ctx.strokeRect(bd + 9, bd + 9, w - (bd + 9) * 2, h - (bd + 9) * 2);

  // Outer embossed line
  ctx.strokeStyle = '#151515';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bd + 16, bd + 16, w - (bd + 16) * 2, h - (bd + 16) * 2);

  // ═══ CORNER BRACKETS — embossed dark grey ═══
  const cm = bd + 20, csz = 55;
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#181818';
  // TL
  ctx.beginPath();
  ctx.moveTo(cm, cm + csz * 0.25);
  ctx.lineTo(cm, cm);
  ctx.lineTo(cm + csz * 0.25, cm);
  ctx.stroke();
  // TR
  ctx.beginPath();
  ctx.moveTo(w - cm, cm + csz * 0.25);
  ctx.lineTo(w - cm, cm);
  ctx.lineTo(w - cm - csz * 0.25, cm);
  ctx.stroke();
  // BL
  ctx.beginPath();
  ctx.moveTo(cm, h - cm - csz * 0.25);
  ctx.lineTo(cm, h - cm);
  ctx.lineTo(cm + csz * 0.25, h - cm);
  ctx.stroke();
  // BR
  ctx.beginPath();
  ctx.moveTo(w - cm, h - cm - csz * 0.25);
  ctx.lineTo(w - cm, h - cm);
  ctx.lineTo(w - cm - csz * 0.25, h - cm);
  ctx.stroke();

  // ═══ CENTER MANDALA — embossed dark rings ═══
  const cx = w / 2, cy = h / 2;
  const rings = [
    { r: 175, w: 1.5, color: '#181818' },
    { r: 140, w: 2.5, color: '#151515' },
    { r: 105, w: 2, color: '#181818' },
    { r: 70, w: 2, color: '#151515' },
    { r: 40, w: 1.5, color: '#1a1a1a' },
  ];
  for (const ring of rings) {
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = ring.w;
    ctx.beginPath();
    ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Embossed octagram star
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#181818';
  drawStarShape(ctx, cx, cy, 80, 130, 8);

  // Inner octagram
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#1a1a1a';
  drawStarShape(ctx, cx, cy, 35, 68, 8);

  // Center embossed diamond
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 20);
  ctx.lineTo(cx + 12, cy);
  ctx.lineTo(cx, cy + 20);
  ctx.lineTo(cx - 12, cy);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();

  // Embossed dot ring
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 52, cy + Math.sin(a) * 52, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Subtle highlight dot
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * 52 - 1, cy + Math.sin(a) * 52 - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  return c;
}

// ═══════════════════════════════════════════
//  CARD FRONT — Pure black, embossed dark grey
// ═══════════════════════════════════════════
export function createCardFrontTexture(
  symbol: string, number: number, nameZh: string,
): HTMLCanvasElement {
  const w = 512, h = 768;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;

  // Pure black base
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // Embossed micro texture
  ctx.fillStyle = 'rgba(25,25,25,0.025)';
  for (let i = 0; i < 1800; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }

  // ═══ BLACK BORDER — embossed ═══
  const bd = 36;
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, w, h);
  ctx.clearRect(bd, bd, w - bd * 2, h - bd * 2);

  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  ctx.strokeRect(bd + 3, bd + 3, w - (bd + 3) * 2, h - (bd + 3) * 2);

  ctx.strokeStyle = '#0a0a0a';
  ctx.lineWidth = 10;
  ctx.strokeRect(bd + 9, bd + 9, w - (bd + 9) * 2, h - (bd + 9) * 2);

  ctx.strokeStyle = '#151515';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bd + 16, bd + 16, w - (bd + 16) * 2, h - (bd + 16) * 2);

  // Corner brackets
  const cm = bd + 14, csz = 50;
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#181818';
  drawDarkCorner(ctx, cm, cm, csz, 'tl');
  drawDarkCorner(ctx, w - cm, cm, csz, 'tr');
  drawDarkCorner(ctx, cm, h - cm, csz, 'bl');
  drawDarkCorner(ctx, w - cm, h - cm, csz, 'br');

  const cx = w / 2;

  // Roman numeral — embossed dark grey
  const roman: Record<number, string> = {
    0: '0', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
    6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
    11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV',
    16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX', 21: 'XXI',
  };
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 42px "Georgia","Times New Roman",serif';
  ctx.textAlign = 'center';
  ctx.fillText(roman[number] || String(number), cx, 82);

  // Line
  ctx.strokeStyle = '#181818';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 55, 96);
  ctx.lineTo(cx + 55, 96);
  ctx.stroke();
  ctx.fillStyle = '#1a1a1a';
  drawSmallDiamond(ctx, cx - 57, 96, 4);
  drawSmallDiamond(ctx, cx + 57, 96, 4);

  // Center decorative circle
  const symbolY = h / 2;
  ctx.strokeStyle = '#181818';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, symbolY, 115, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#151515';
  ctx.beginPath();
  ctx.arc(cx, symbolY, 132, 0, Math.PI * 2);
  ctx.stroke();

  // Filigree ring
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#1a1a1a';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = cx + Math.cos(a) * 115;
    const y = symbolY + Math.sin(a) * 115;
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.stroke();
    const a2 = a + Math.PI / 8;
    const bx = cx + Math.cos(a2) * 55;
    const by = symbolY + Math.sin(a2) * 55;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cx, symbolY, bx, by);
    ctx.stroke();
  }

  // Symbol — embossed dark grey
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '100px "Segoe UI Emoji","Apple Color Emoji",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, cx, symbolY);

  // Bottom name section
  ctx.strokeStyle = '#181818';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 75, h - 88);
  ctx.lineTo(cx + 75, h - 88);
  ctx.stroke();
  ctx.fillStyle = '#1a1a1a';
  drawSmallDiamond(ctx, cx - 77, h - 88, 4);
  drawSmallDiamond(ctx, cx + 77, h - 88, 4);

  ctx.fillStyle = '#1a1a1a';
  ctx.font = '300 28px "PingFang SC","Microsoft YaHei","Noto Sans SC",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(nameZh, cx, h - 56);

  ctx.fillStyle = '#151515';
  ctx.font = 'bold 14px "Georgia",serif';
  ctx.fillText('NO. ' + number, cx, h - 34);

  return c;
}
