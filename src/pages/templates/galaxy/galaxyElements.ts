import * as THREE from 'three';

export const createStars = (count: number, radius: number, size: number, opacity: number) => {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size, sizeAttenuation: true, color: 0xffffff, transparent: true, opacity });
  mat.userData = { baseSize: size, phase: Math.random() * Math.PI * 2 };
  const points = new THREE.Points(geo, mat);
  points.renderOrder = -1;
  return points;
};

export const createSpiralArm = (armIndex: number, arms: number, pointsCount: number, maxR: number, jitter: number, color: number, size: number, opacity: number) => {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(pointsCount * 3);
  let k = 0;
  for (let i = 0; i < pointsCount; i++) {
    const t = i / pointsCount;
    const angle = t * Math.PI * 6 + armIndex * (2 * Math.PI / arms);
    const r = t * maxR;
    const x = r * Math.cos(angle);
    const y = (Math.sin(t * 8) * 0.15 * r) + (Math.random() - 0.5) * jitter * 2;
    const z = r * Math.sin(angle) - 800;
    positions[k++] = x + (Math.random() - 0.5) * jitter;
    positions[k++] = y;
    positions[k++] = z + (Math.random() - 0.5) * jitter;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size, sizeAttenuation: true, color, transparent: true, opacity });
  mat.userData = { baseSize: size, phase: Math.random() * Math.PI * 2, spiral: true };
  const pts = new THREE.Points(geo, mat);
  pts.renderOrder = -3;
  return pts;
};

export const createStarRing = (radius: number, thickness: number, count: number, tiltX: number, tiltY: number, color: number, size: number, opacity: number) => {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  let k = 0;
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = radius + (Math.random() - 0.5) * thickness;
    let x = r * Math.cos(a);
    let y = (Math.random() - 0.5) * thickness * 0.35;
    let z = r * Math.sin(a) - 900;
    const sx = Math.sin(tiltX), cx = Math.cos(tiltX);
    const sy = Math.sin(tiltY), cy = Math.cos(tiltY);
    let y1 = y * cx - z * sx; let z1 = y * sx + z * cx; let x1 = x;
    let z2 = z1 * cy - x1 * sy; let x2 = z1 * sy + x1 * cy; let y2 = y1;
    positions[k++] = x2; positions[k++] = y2; positions[k++] = z2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size, sizeAttenuation: true, color, transparent: true, opacity });
  mat.userData = { baseSize: size, phase: Math.random() * Math.PI * 2, ring: true };
  const pts = new THREE.Points(geo, mat);
  pts.renderOrder = -3;
  return pts;
};
