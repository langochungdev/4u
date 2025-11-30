// noelLove.ts

/**
 * Hàm 1: Khởi tạo Slider Trái Tim (Chạy CDN an toàn)
 */
export function initNoelLove(onSliderDone: () => void) {
  const waitInterval = setInterval(() => {
    const w = window as any;
    if (w.gsap && w.Draggable) {
      clearInterval(waitInterval);
      runSliderLogic(w.gsap, w.Draggable, onSliderDone);
    }
  }, 100);
}

/**
 * Hàm 2: Khởi tạo Cảnh Giáng Sinh (Chỉ tuyết và FadeIn)
 */
export function initChristmasScene() {
  const w = window as any;
  const gsap = w.gsap;
  
  // 1. Tuyết rơi
  const createSnow = (num: number) => {
    const container = document.body;
    for (let i = 0; i < num; i++) {
      const drop = document.createElement("div");
      drop.className = "drop snow";
      drop.style.left = Math.random() * window.innerWidth + "px";
      drop.style.animationDelay = Math.random() * 5 + "s";
      drop.style.width = Math.random() * 5 + 3 + "px";
      drop.style.height = drop.style.width;
      container.appendChild(drop);
      setTimeout(() => drop.classList.add("animate"), 100);
    }
  };
  createSnow(80);

  // 2. Hiện Scene lên nhẹ nhàng
  if (gsap) {
    gsap.fromTo(".christmas-scene", 
      { opacity: 0, scale: 0.95 }, 
      { duration: 1.5, opacity: 1, scale: 1, ease: "power2.out" }
    );
  }
}

// LOGIC SLIDER (Giữ nguyên)
function runSliderLogic(gsap: any, Draggable: any, onSliderDone: () => void) {
  gsap.registerPlugin(Draggable);
  const loveSliderSVG = document.querySelector("#loveSliderSVG") as SVGSVGElement;
  if (!loveSliderSVG) return;
  gsap.set(loveSliderSVG, { visibility: "visible" });

  const draggerEl = document.querySelector(".dragger");
  const heartChat = document.querySelector(".heartChat");
  const heartFill = document.querySelector(".heartFill");
  const track = document.querySelector(".track");
  
  if (!draggerEl || !heartChat || !heartFill) return;

  const maxDrag = 705;
  const heartFillMaxPosY = -50;
  const draggerProp = gsap.getProperty(draggerEl);
  let finished = false;

  gsap.set(heartFill, { transformOrigin: "50% 0%" });
  gsap.set(heartChat, { x: -18, y: 235, transformOrigin: "50% 105%" });

  const onDrag = () => {
    const posX = draggerProp("x");
    const progress = posX / maxDrag;

    gsap.to(heartChat, { duration: 0.1, x: posX - 18 });
    gsap.to(heartFill, { duration: 0.1, y: progress * heartFillMaxPosY });
    if (track) gsap.set(track, { strokeDasharray: `${progress * 100}% 100%` });

    if (progress >= 0.98 && !finished) {
      finished = true;
      onSliderDone();
    }
  };

  Draggable.create(draggerEl, {
    type: "x",
    bounds: { minX: 0, maxX: maxDrag, minY: 0, maxY: 0 },
    onDrag: onDrag,
    onThrowUpdate: onDrag,
    onPress: () => gsap.to(heartChat, { duration: 0.1, scale: 0.98 }),
    onRelease: () => gsap.to(heartChat, { duration: 0.6, scale: 1, ease: "elastic.out(1, 0.3)" })
  });
}