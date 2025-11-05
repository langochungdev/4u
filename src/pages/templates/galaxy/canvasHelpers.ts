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
  // Keep original aspect ratio
  const width = img.width;
  const height = img.height;
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d')!;
  
  // Only rounded corners, no heart shape
  tempCtx.save();
  const radius = Math.min(width, height) * (0.1 + Math.random() * 0.1); // 10-20% of smallest dimension
  tempCtx.beginPath();
  tempCtx.moveTo(radius, 0);
  tempCtx.lineTo(width - radius, 0);
  tempCtx.quadraticCurveTo(width, 0, width, radius);
  tempCtx.lineTo(width, height - radius);
  tempCtx.quadraticCurveTo(width, height, width - radius, height);
  tempCtx.lineTo(radius, height);
  tempCtx.quadraticCurveTo(0, height, 0, height - radius);
  tempCtx.lineTo(0, radius);
  tempCtx.quadraticCurveTo(0, 0, radius, 0);
  tempCtx.closePath();
  tempCtx.clip();
  
  tempCtx.drawImage(img, 0, 0, width, height);
  tempCtx.restore();
  
  return tempCanvas;
};
