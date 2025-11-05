export const createPlanetTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 512, 256);
  gradient.addColorStop(0, '#0d47a1');
  gradient.addColorStop(0.5, '#1b5e20');
  gradient.addColorStop(1, '#424242');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);
  return canvas;
};

export const createTextSprite = (text: string, fontSize = 48) => {
  const pad = 16;
  const cvs = document.createElement('canvas');
  const ctx = cvs.getContext('2d')!;
  ctx.font = `bold ${fontSize}px system-ui,Segoe UI,Roboto,Arial`;
  const w = Math.ceil(ctx.measureText(text).width);
  cvs.width = w + pad * 2;
  cvs.height = fontSize + pad * 2;
  const g = cvs.getContext('2d')!;
  
  // Neon glow effect
  g.shadowColor = 'rgba(255,105,180,0.8)';
  g.shadowBlur = 30;
  g.fillStyle = 'rgba(255,105,180,0.5)';
  g.font = `bold ${fontSize}px system-ui,Segoe UI,Roboto,Arial`;
  g.textBaseline = 'top';
  for (let i = 0; i < 5; i++) {
    g.fillText(text, pad + i * 0.5, pad + i * 0.5);
  }
  g.shadowColor = 'transparent';
  g.shadowBlur = 0;
  g.fillStyle = '#ffb3d9';
  g.font = `bold ${fontSize}px system-ui,Segoe UI,Roboto,Arial`;
  g.textBaseline = 'top';
  g.fillText(text, pad, pad);
  
  return cvs;
};

export const createImageFrame = (img: HTMLImageElement) => {
  const tempCanvas = document.createElement('canvas');
  const size = 512;
  tempCanvas.width = size;
  tempCanvas.height = size;
  const tempCtx = tempCanvas.getContext('2d')!;
  
  const frameStyle = Math.random() > 0.5 ? 0 : 1;
  
  tempCtx.save();
  if (frameStyle === 0) {
    const radius = 30 + Math.random() * 50;
    tempCtx.beginPath();
    tempCtx.moveTo(radius, 0);
    tempCtx.lineTo(size - radius, 0);
    tempCtx.quadraticCurveTo(size, 0, size, radius);
    tempCtx.lineTo(size, size - radius);
    tempCtx.quadraticCurveTo(size, size, size - radius, size);
    tempCtx.lineTo(radius, size);
    tempCtx.quadraticCurveTo(0, size, 0, size - radius);
    tempCtx.lineTo(0, radius);
    tempCtx.quadraticCurveTo(0, 0, radius, 0);
    tempCtx.closePath();
    tempCtx.clip();
  } else {
    tempCtx.beginPath();
    tempCtx.moveTo(size / 2, size * 0.35);
    tempCtx.bezierCurveTo(size / 2, size * 0.25, size * 0.35, size * 0.1, size * 0.2, size * 0.25);
    tempCtx.bezierCurveTo(size * 0.05, size * 0.4, size * 0.05, size * 0.55, size * 0.2, size * 0.7);
    tempCtx.bezierCurveTo(size * 0.3, size * 0.8, size / 2, size * 0.95, size / 2, size * 0.95);
    tempCtx.bezierCurveTo(size / 2, size * 0.95, size * 0.7, size * 0.8, size * 0.8, size * 0.7);
    tempCtx.bezierCurveTo(size * 0.95, size * 0.55, size * 0.95, size * 0.4, size * 0.8, size * 0.25);
    tempCtx.bezierCurveTo(size * 0.65, size * 0.1, size / 2, size * 0.25, size / 2, size * 0.35);
    tempCtx.closePath();
    tempCtx.clip();
  }
  
  tempCtx.drawImage(img, 0, 0, size, size);
  tempCtx.restore();
  
  return tempCanvas;
};
