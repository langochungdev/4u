// /christmas/noel/noelLove.ts
import { gsap } from "gsap";
import { MotionPathPlugin, Draggable } from "gsap/all";

// Đăng ký plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin, Draggable);
}

/** ========== SLIDER ========== */
export function initSlider(onComplete?: () => void) {
  if (typeof window === "undefined") return;

  const dragEl = document.querySelector(".dragger") as HTMLElement | null;
  const heartFill = document.querySelector(".heartFill") as SVGRectElement | null;
  const heartChat = document.querySelector(".heartChat") as SVGGElement | null;
  const sliderSvg = document.getElementById("loveSliderSVG") as SVGSVGElement | null;
  const treeContainer = document.querySelector(".noel-tree-container") as HTMLElement | null;

  if (!dragEl || !heartFill || !heartChat || !sliderSvg || !treeContainer) return;

  const maxX = 705;
  let completed = false;

  Draggable.create(dragEl, {
    type: "x",
    bounds: { minX: 0, maxX },
    onDrag() {
      const x = this.x as number;

      gsap.to(heartChat, { x: x - 18, duration: 0.1 });
      gsap.to(heartFill, { y: -50 * (x / maxX), duration: 0.1 });

      if (!completed && x >= maxX) {
        completed = true;
        sliderSvg.style.display = "none";
        treeContainer.style.display = "block";
        onComplete?.();
      }
    },
  });

  gsap.set(heartChat, { x: -18, y: 235, transformOrigin: "50% 105%" });
}

/** ========== ANIMATION CÂY THÔNG ========== */
function initTreeTimeline() {
  const tree = document.querySelector(".tree") as SVGGraphicsElement | null;
  const star = document.querySelector(".treeStar") as SVGGraphicsElement | null;

  if (!tree || !star) return null;

  const tl = gsap.timeline();

  tl.from(tree, {
    duration: 1.4,
    scaleY: 0,
    opacity: 0,
    transformOrigin: "50% 100%",
    ease: "power2.out",
  }).from(
    star,
    {
      duration: 1,
      scale: 0,
      opacity: 0,
      transformOrigin: "50% 50%",
      ease: "back.out(1.6)",
    },
    "-=0.4"
  );

  return tl;
}

/** ========== SANTA + GIFT RƠI ========== */
function startSantaAndGifts() {
  const santa = document.querySelector(".noel-santa") as HTMLElement | null;
  const gifts = document.querySelectorAll(".noel-gift") as NodeListOf<HTMLElement>;

  if (!santa) return;

  gsap.fromTo(
    santa,
    {
      opacity: 0,
      x: "-40%",
      y: "-30%",
      rotate: -10,
    },
    {
      opacity: 1,
      x: "0%",
      y: "0%",
      rotate: 0,
      duration: 1.5,
      ease: "power2.out",
      onComplete() {
        gifts.forEach((gift, index) => {
          gsap.fromTo(
            gift,
            {
              opacity: 0,
              y: -80,
              scale: 0.4,
              rotate: -15,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotate: 0,
              duration: 0.9,
              delay: index * 0.2,
              ease: "bounce.out",
            }
          );
        });
      },
    }
  );
}

/** ========== HÀM EXPORT CHÍNH ========== */
export function initNoelLove() {
  if (typeof window === "undefined") return;

  const treeTl = initTreeTimeline();
  if (treeTl) {
    treeTl.pause();
    treeTl.eventCallback("onComplete", () => {
      startSantaAndGifts();
    });
  }

  initSlider(() => {
    treeTl?.restart();
  });
}
