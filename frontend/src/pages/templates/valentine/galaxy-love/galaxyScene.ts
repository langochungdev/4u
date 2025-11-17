import * as THREE from 'three';
import { createStars, createSpiralArm, createStarRing } from './galaxyElements';
import { createPlanetTexture, createTextSprite, createImageFrame } from './canvasHelpers';

export const initGalaxyScene = (
  canvas: HTMLCanvasElement,
  messages: string[],
  imageUrls: string[]
) => {
  // ========== CẤU HÌNH - CONFIGURATION ==========
  // Detect mobile for performance optimization
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  
  // Số lượng lần render cho mỗi ảnh
  const MAX_IMAGE_REPEAT = isMobile ? 2 : 3;
  
  // Số lượng lần render cho mỗi thông điệp/text
  const MAX_MESSAGE_REPEAT = isMobile ? 3 : 5;
  
  // Khoảng cách render (min, max) - radius từ tâm
  const IMAGE_DISTANCE_MIN = 13.0;
  const IMAGE_DISTANCE_MAX = 30.0;
  const MESSAGE_DISTANCE_MIN = 10.0;
  const MESSAGE_DISTANCE_MAX = 30.0;
  // ============================================
  
  // Renderer with mobile optimization
  const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: !isMobile, 
    powerPreference: isMobile ? 'default' : 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Scene & camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 4000);
  const target = new THREE.Vector3(0, 0, 0);

  // Camera controls
  let targetAz = 0, targetPol = 0.9, targetDist = 10;
  let az = targetAz, pol = targetPol, dist = targetDist;
  const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

  const updateCamera = (immediate = false) => {
    const lerp = immediate ? 1 : 0.12;
    az += (targetAz - az) * lerp;
    pol += (targetPol - pol) * lerp;
    dist += (targetDist - dist) * lerp;
    const sp = Math.sin(pol), cp = Math.cos(pol);
    camera.position.set(dist * sp * Math.cos(az), dist * cp, dist * sp * Math.sin(az));
    camera.lookAt(target);
  };

  // Pointer controls
  let dragging = false, lastX = 0, lastY = 0;
  let touches: Map<number, { x: number, y: number, prevX: number, prevY: number }> = new Map();
  let initialPinchDistance = 0;
  let initialDistValue = targetDist;
  const ROT_SPEED = 0.010;
  
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY, prevX: e.clientX, prevY: e.clientY });
      if (touches.size === 2) {
        const touchArray = Array.from(touches.values());
        const t1 = touchArray[0];
        const t2 = touchArray[1];
        if (t1 && t2) {
          const dx = t2.x - t1.x;
          const dy = t2.y - t1.y;
          initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
          initialDistValue = targetDist;
        }
      }
    } else {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    }
  };
  
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      const current = touches.get(e.pointerId);
      if (current) {
        current.prevX = current.x;
        current.prevY = current.y;
        current.x = e.clientX;
        current.y = e.clientY;
        
        if (touches.size === 2) {
          const touchArray = Array.from(touches.values());
          const t1 = touchArray[0];
          const t2 = touchArray[1];
          if (t1 && t2) {
            const dx = t2.x - t1.x;
            const dy = t2.y - t1.y;
            const currentDist = Math.sqrt(dx * dx + dy * dy);
            
            if (initialPinchDistance > 0) {
              const scale = currentDist / initialPinchDistance;
              targetDist = clamp(initialDistValue / scale, 2.5, 40);
            }
          }
        } else if (touches.size === 1) {
          const dx = current.x - current.prevX;
          const dy = current.y - current.prevY;
          targetAz += dx * ROT_SPEED;
          targetPol -= dy * ROT_SPEED;
          targetPol = clamp(targetPol, 0.1, Math.PI - 0.1);
        }
      }
    } else {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      targetAz += dx * ROT_SPEED;
      targetPol -= dy * ROT_SPEED;
      targetPol = clamp(targetPol, 0.1, Math.PI - 0.1);
    }
  };
  
  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      touches.delete(e.pointerId);
      if (touches.size < 2) {
        initialPinchDistance = 0;
      }
    } else {
      dragging = false;
    }
  };
  
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const k = Math.exp(e.deltaY * 0.0015);
    targetDist = clamp(targetDist * k, 2.5, 40);
  };
  
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === 'f') {
      targetAz = 0;
      targetPol = 0.9;
      targetDist = 10;
      updateCamera(true);
    }
  };

  // Register events IMMEDIATELY (before heavy scene creation)
  canvas.addEventListener('pointerdown', onPointerDown, { passive: true });
  canvas.addEventListener('pointermove', onPointerMove, { passive: true });
  canvas.addEventListener('pointerup', onPointerUp, { passive: true });
  canvas.addEventListener('pointercancel', onPointerUp, { passive: true });
  canvas.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKeyDown);

  // Set initial camera position immediately
  updateCamera(true);

  // Create galaxy elements with mobile optimization
  const starGroup = new THREE.Group();
  scene.add(starGroup);

  // Reduce star counts on mobile
  const starMultiplier = isMobile ? 0.5 : 1.0;
  starGroup.add(createStars(Math.floor(14000 * starMultiplier), 900, 1.0, 0.9));
  starGroup.add(createStars(Math.floor(11000 * starMultiplier), 1600, 1.7, 0.78));
  starGroup.add(createStars(Math.floor(8000 * starMultiplier), 2400, 2.1, 0.6));

  starGroup.add(createSpiralArm(0, 4, 2600, 2200, 28, 0xff99ff, 2.0, 0.26));
  starGroup.add(createSpiralArm(1, 4, 2600, 2200, 28, 0x88bbff, 1.9, 0.26));
  starGroup.add(createSpiralArm(2, 4, 2600, 2200, 28, 0xffddb3, 1.8, 0.24));
  starGroup.add(createSpiralArm(3, 4, 2600, 2200, 28, 0xb388ff, 1.9, 0.24));

  starGroup.add(createStarRing(Math.floor(1500 * starMultiplier), 400, 4500, -0.18, 0.05, 0xffe8ff, 1.6, 0.28));
  starGroup.add(createStarRing(Math.floor(2100 * starMultiplier), 520, 5500, 0.12, -0.08, 0xd0e0ff, 1.8, 0.22));

  // Planet with mobile optimization
  const coreGeo = new THREE.SphereGeometry(1.15, isMobile ? 32 : 64, isMobile ? 32 : 64);
  const coreMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    metalness: 0.3, 
    roughness: 0.2, 
    emissive: 0x000000, 
    emissiveIntensity: 0, 
    transparent: false 
  });
  
  // Load Earth texture (async, non-blocking)
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    new URL('./earth.jpg', import.meta.url).href,
    (texture) => {
      coreMat.map = texture;
      coreMat.needsUpdate = true;
    },
    undefined,
  () => {
      // Fallback to canvas texture
      const planetCanvas = createPlanetTexture();
      const fakeTexture = new THREE.CanvasTexture(planetCanvas);
      coreMat.map = fakeTexture;
      coreMat.needsUpdate = true;
    }
  );
  
  const core = new THREE.Mesh(coreGeo, coreMat);
  const holeGroup = new THREE.Group();
  holeGroup.add(core);
  scene.add(holeGroup);

  // Inner ring with mobile optimization
  const createInnerStarDisk = (params: any) => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(params.count * 3);
    for (let i = 0; i < params.count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = params.radius + (Math.random() - 0.5) * params.thickness;
      positions[i * 3 + 0] = r * Math.cos(ang);
      positions[i * 3 + 1] = (Math.random() - 0.5) * params.thickness * 0.2;
      positions[i * 3 + 2] = r * Math.sin(ang);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ 
      size: params.size, 
      sizeAttenuation: true, 
      color: params.color, 
      transparent: true, 
      opacity: params.opacity, 
      blending: THREE.AdditiveBlending, 
      depthWrite: false 
    });
    mat.userData = { baseSize: params.size };
    const ring = new THREE.Points(geo, mat);
    ring.rotation.x = params.tilt;
    return ring;
  };

  const innerRing = createInnerStarDisk({ 
    radius: 2.5, 
    thickness: 0.9, 
    count: isMobile ? 2500 : 4200, 
    color: 0x00ffff, 
    size: 0.09, 
    opacity: 0.95, 
    tilt: 0 
  });
  scene.add(innerRing);
  const innerRingMat = innerRing.material as THREE.PointsMaterial;
  const baseInnerSize = innerRingMat.size;

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const rimLight = new THREE.PointLight(0x3a6fff, 5.0, 60, 2);
  rimLight.position.set(-6, 4, 8);
  scene.add(rimLight);
  const warm = new THREE.PointLight(0xff7a3a, 4.0, 60, 2);
  warm.position.set(6, -3, -6);
  scene.add(warm);

  // Text sprites
  const namesGroup = new THREE.Group();
  
  messages.forEach((text) => {
    for (let r = 0; r < MAX_MESSAGE_REPEAT; r++) {
      const textCanvas = createTextSprite(text, 48);
      const tex = new THREE.CanvasTexture(textCanvas);
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      const sprite = new THREE.Sprite(mat);
      const scale = 0.0045;
      sprite.scale.set(textCanvas.width * scale, textCanvas.height * scale, 1);
      
      const rad = MESSAGE_DISTANCE_MIN + Math.random() * (MESSAGE_DISTANCE_MAX - MESSAGE_DISTANCE_MIN);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      sprite.position.set(
        rad * Math.sin(phi) * Math.cos(theta),
        rad * Math.cos(phi) * 0.6,
        rad * Math.sin(phi) * Math.sin(theta)
      );
      sprite.scale.multiplyScalar(0.85 + Math.random() * 0.5);
      namesGroup.add(sprite);
    }
  });
  starGroup.add(namesGroup);

  // Image sprites
  const imagesGroup = new THREE.Group();
  starGroup.add(imagesGroup);
  
  const randomPosition = (minR: number, maxR: number) => {
    const r = minR + Math.random() * (maxR - minR);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi) * 0.6,
      r * Math.sin(phi) * Math.sin(theta)
    );
  };

  const loader = new THREE.TextureLoader();
  imageUrls.forEach((url) => {
    loader.load(url, (tex: THREE.Texture) => {
      const img = tex.image as HTMLImageElement;
      for (let i = 0; i < MAX_IMAGE_REPEAT; i++) {
        const framedCanvas = createImageFrame(img);
        const framedTex = new THREE.CanvasTexture(framedCanvas);
        framedTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const mat = new THREE.SpriteMaterial({ map: framedTex, transparent: true, depthWrite: false });
        const spr = new THREE.Sprite(mat);
        
        // Calculate aspect ratio to prevent distortion
        const aspect = framedCanvas.width / framedCanvas.height;
        const base = 3.0 * (0.85 + Math.random() * 0.5);
        spr.scale.set(base * aspect, base, 1);
        
        spr.position.copy(randomPosition(IMAGE_DISTANCE_MIN, IMAGE_DISTANCE_MAX));
        imagesGroup.add(spr);
      }
    });
  });

  // Animation - start immediately
  let t = 0;
  let animationId: number;
  
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    t += 0.016;
    
    innerRingMat.size = baseInnerSize * (1.0 + 0.15 * Math.sin(t * 0.9));
    holeGroup.rotation.y -= 0.0008;
    starGroup.rotation.y += 0.0006;

    starGroup.children.forEach((obj: any, i: number) => {
      if (obj.material && (obj.material as any).userData?.baseSize) {
        const mat = obj.material as THREE.PointsMaterial;
        const base = mat.userData.baseSize;
        const ph = mat.userData.phase;
        mat.size = base * (1.0 + 0.08 * Math.sin(t * 0.8 + ph + i));
      }
    });

    namesGroup.children.forEach((sprite: any) => {
      sprite.lookAt(camera.position);
    });
    
    imagesGroup.children.forEach((sprite: any) => {
      sprite.lookAt(camera.position);
    });

    updateCamera(false);
    renderer.render(scene, camera);
  };

  // Start animation loop immediately
  animate();

  // Resize handler
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  // Cleanup function
  return () => {
    cancelAnimationFrame(animationId);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointercancel', onPointerUp);
    canvas.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  };
};
