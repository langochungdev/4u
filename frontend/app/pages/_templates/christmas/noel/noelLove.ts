// noelLove.ts
// GSAP + plugin global qua CDN → khai báo để TS đỡ báo lỗi
declare const gsap: any;
declare const MorphSVGPlugin: any;
declare const MotionPathPlugin: any;
declare const DrawSVGPlugin: any;
declare const Physics2DPlugin: any;
declare const Draggable: any;

type Point = { x: number; y: number };

/**
 * Khởi tạo Noel Love:
 * - rootEl: element bọc toàn bộ template (có loveSliderSVG + mainSVG)
 * - onSliderDone: callback (Vue sẽ ẩn slider, hiện cây)
 */
export function initNoelLove(rootEl: HTMLElement, onSliderDone?: () => void): void {
  if (typeof window === "undefined" || !rootEl) return;

  const select = <T extends Element = Element>(s: string): T | null => rootEl.querySelector<T>(s);
  const selectAll = <T extends Element = Element>(s: string): NodeListOf<T> => rootEl.querySelectorAll<T>(s);

  // ===================== SNOW (DOM THUẦN, THAY JQUERY) =====================

  function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function createSnowDrops(num: number, minLeft = 60, maxLeft = 1280) {
    const body = document.body;
    for (let i = 1; i <= num; i++) {
      const drop = document.createElement("div");
      drop.className = "drop snow";
      drop.id = `drop_${i}`;
      drop.style.left = randomInt(minLeft, maxLeft) + "px";
      body.appendChild(drop);
    }
  }

  function runSnow(num: number, speed: number) {
    function loop(n: number) {
      if (n <= 0) return;
      setTimeout(() => {
        const id = randomInt(1, num);
        const el = document.getElementById(`drop_${id}`);
        if (el) el.classList.add("animate");
        loop(n - 1);
      }, speed);
    }
    loop(num);
  }

  // ===================== CÂY THÔNG (TREE + PARTICLE GSAP) =====================

  function getSVGPoints(pathSelector: string): Point[] {
    const pathEl = select<SVGPathElement>(pathSelector);
    if (!pathEl || !MotionPathPlugin || !MotionPathPlugin.getRawPath) return [];

    const rawPath = MotionPathPlugin.getRawPath(pathEl) as number[][];
    if (!rawPath || rawPath.length === 0) return [];

    const first = rawPath[0];
    if (!first || first.length < 2) return [];

    const arr: Point[] = [];
    for (let i = 0; i + 1 < first.length; i += 2) {
      const x = first[i] ?? 0;
      const y = first[i + 1] ?? 0;
      arr.push({ x, y });
    }
    return arr;
  }

  function initTree() {
    if (!gsap || !MotionPathPlugin || !DrawSVGPlugin || !Physics2DPlugin || !MorphSVGPlugin) {
      console.warn("[noelLove] GSAP plugins chưa load.");
      return;
    }

    MorphSVGPlugin.convertToPath("polygon");

    const mainSVG = select<SVGSVGElement>(".mainSVG");
    const sparkle = select<SVGCircleElement>(".sparkle");
    const pContainer = select<SVGGElement>(".pContainer");

    if (!mainSVG || !sparkle || !pContainer) return;

    const mainSVGEl = mainSVG as SVGSVGElement;

    const particleColorArray: string[] = [
      "#E8F6F8",
      "#ACE8F8",
      "#F6FBFE",
      "#A2CBDC",
      "#B74551",
      "#5DBA72",
      "#910B28",
      "#910B28",
      "#446D39",
    ];

    const particleTypeArray: string[] = ["#star", "#circ", "#cross", "#heart"];

    const treePath = getSVGPoints(".treePath");
    const treeBottomPath = getSVGPoints(".treeBottomPath");

    if (!treePath.length || !treeBottomPath.length) return;

    const particlePool: Element[] = [];
    let particleCount = 0;
    const numParticles = 201;
    let showParticle = true;

    gsap.set(mainSVGEl, { visibility: "visible" });
    gsap.set(sparkle, { transformOrigin: "50% 50%", y: -100 });

    function flicker(p: Element) {
      gsap.killTweensOf(p, { opacity: true });
      gsap.fromTo(
        p,
        { opacity: 1 },
        {
          duration: 0.07,
          opacity: Math.random(),
          repeat: -1,
        },
      );
    }

    function createParticles() {
      for (let i = 0; i < numParticles; i++) {
        const type = particleTypeArray[i % particleTypeArray.length] ?? "#star";
        const template = select<SVGElement>(type);
        if (!template) continue;

        const p = template.cloneNode(true) as SVGElement;
        mainSVGEl.appendChild(p);

        const fillColor = particleColorArray[i % particleColorArray.length] ?? "#FFFFFF";
        p.setAttribute("fill", fillColor);
        p.setAttribute("class", "particle");
        particlePool.push(p);

        gsap.set(p, {
          x: -100,
          y: -100,
          transformOrigin: "50% 50%",
        });
      }
    }

    const getScale = gsap.utils.random(0.5, 3, 0.001, true);

    function playParticle() {
      if (!showParticle) return;
      const p = particlePool[particleCount];
      if (!p) return;

      const pcX = gsap.getProperty(pContainer, "x") as number;
      const pcY = gsap.getProperty(pContainer, "y") as number;

      gsap.set(p, { x: pcX, y: pcY, scale: getScale() });

      const tl = gsap.timeline();
      tl.to(p, {
        duration: gsap.utils.random(0.61, 6),
        physics2D: {
          velocity: gsap.utils.random(-23, 23),
          angle: gsap.utils.random(-180, 180),
          gravity: gsap.utils.random(-6, 50),
        },
        scale: 0,
        rotation: gsap.utils.random(-123, 360),
        ease: "power1",
        onStart: flicker,
        onStartParams: [p],
        onRepeat: (pp: Element) => {
          gsap.set(pp, { scale: getScale() });
        },
        onRepeatParams: [p],
      });

      particleCount++;
      if (particleCount >= numParticles) particleCount = 0;
    }

    function drawStar() {
      const treeBottomStart = treeBottomPath[0] || { x: 0, y: 0 };

      const starTl = gsap.timeline({ onUpdate: playParticle });

      starTl
        .to([pContainer, sparkle], {
          duration: 6,
          motionPath: {
            path: ".treePath",
            autoRotate: false,
          },
          ease: "linear",
        })
        .to([pContainer, sparkle], {
          duration: 1,
          onStart() {
            showParticle = false;
          },
          x: treeBottomStart.x,
          y: treeBottomStart.y,
        })
        .to(
          [pContainer, sparkle],
          {
            duration: 2,
            onStart() {
              showParticle = true;
            },
            motionPath: {
              path: ".treeBottomPath",
              autoRotate: false,
            },
            ease: "linear",
          },
          "-=0",
        )
        .from(
          ".treeBottomMask",
          {
            duration: 2,
            drawSVG: "0% 0%",
            stroke: "#FFF",
            ease: "linear",
          },
          "-=2",
        );

      const mainTl = gsap.timeline({ delay: 0, repeat: 0 });

      mainTl
        .from([".treePathMask", ".treePotMask"], {
          drawSVG: "0% 0%",
          stroke: "#FFF",
          stagger: { each: 6 },
          duration: 6,
          ease: "linear",
        })
        .from(
          ".treeStar",
          {
            duration: 3,
            scaleY: 0,
            scaleX: 0.15,
            transformOrigin: "50% 50%",
            ease: "elastic(1,0.5)",
          },
          "-=4",
        )
        .to(
          ".sparkle",
          {
            duration: 3,
            opacity: 0,
            ease: "rough({strength: 2, points: 100, template: linear, taper: both, randomize: true, clamp: false})",
          },
          "-=0",
        )
        .to(
          ".treeStarOutline",
          {
            duration: 1,
            opacity: 1,
            ease: "rough({strength: 2, points: 16, template: linear, taper: none, randomize: true, clamp: false})",
          },
          "+=1",
        );

      mainTl.add(starTl, 0);
      gsap.globalTimeline.timeScale(1.5);
    }

    createParticles();
    drawStar();
  }

  // ===================== SLIDER TRÁI TIM (DRAGGABLE) =====================

  function initSlider() {
    if (!gsap || !Draggable) {
      console.warn("[noelLove] Draggable chưa load.");
      return;
    }

    const heartFill = select<SVGRectElement>(".heartFill");
    const heartChat = select<SVGGElement>(".heartChat");
    const track = select<SVGLineElement>(".track");
    const follower = select<SVGCircleElement>(".follower");
    const liquidFollower = select<SVGCircleElement>(".liquidFollower");
    const dragger = select<SVGRectElement>(".dragger");
    const sliderSVG = select<SVGSVGElement>("#loveSliderSVG");

    if (!heartFill || !heartChat || !track || !follower || !liquidFollower || !dragger || !sliderSVG) {
      console.warn("[noelLove] Thiếu phần tử slider.");
      return;
    }

    const maxDrag = 705;
    const heartFillMaxPosY = -50;

    const draggerProp = gsap.getProperty(dragger);

    let followerVX = 0;
    let liquidFollowerY = 0;

    const followerProp = gsap.getProperty(follower);

    gsap.set(heartFill, { transformOrigin: "50% 0%" });
    gsap.set(heartChat, {
      x: -18,
      y: 235,
      transformOrigin: "50% 105%",
    });

    gsap.to(follower, {
      x: "+=0",
      repeat: -1,
      modifiers: {
        x: () => {
          followerVX += (draggerProp("x") - followerProp("x")) * 0.08;
          liquidFollowerY += (draggerProp("x") - followerProp("x")) * 0.98;
          followerVX *= 0.79;
          liquidFollowerY *= 0.4;
          return (followerProp("x") as number) + followerVX;
        },
      },
    });

    gsap.to(liquidFollower, {
      duration: 31,
      x: "+=0",
      repeat: -1,
      modifiers: {
        x: () => {
          const currentX = gsap.getProperty(liquidFollower, "x") as number;
          liquidFollowerY += (draggerProp("x") - currentX) * 0.98;
          liquidFollowerY *= 0.54;
          return (followerProp("x") as number) + liquidFollowerY;
        },
      },
    });

    gsap.to(heartChat, {
      rotation: "+=0",
      repeat: -1,
      ease: "linear",
      modifiers: {
        rotation: (rotation: number) => {
          const val = rotation + followerVX * 0.595;
          return -val;
        },
      },
    });

    gsap.to(heartFill, {
      rotation: "+=0",
      repeat: -1,
      ease: "linear",
      modifiers: {
        rotation: (rotation: number) => {
          const val = rotation + liquidFollowerY * 0.5;
          return val;
        },
      },
    });

    const onDrag = () => {
      const posX = draggerProp("x") as number;
      const progress = posX / maxDrag;

      gsap.to(heartChat, {
        duration: 0.1,
        x: posX - 18,
      });

      const percent = progress * 100;
      const percentY = progress * heartFillMaxPosY;

      gsap.to(track, {
        drawSVG: `100% ${percent}%`,
        ease: "elastic(0.4, 0.16)",
      });

      gsap.to(heartFill, {
        duration: 0.1,
        y: percentY,
      });

      if (progress >= 1) {
        createSnowDrops(150);
        runSnow(150, 150);
        if (onSliderDone) onSliderDone();
      }
    };

    Draggable.create(dragger, {
      type: "x",
      bounds: { minX: 0, maxX: maxDrag, minY: 0, maxY: 0 },
      onDrag,
      onThrowUpdate: onDrag,
      inertia: true,
      overshootTolerance: 0,
      throwResistance: 8000,
      onPress: () => {
        gsap.to(heartChat, {
          duration: 0.1,
          scale: 0.98,
        });
      },
      onRelease: () => {
        gsap.to(heartChat, {
          duration: 0.6,
          scale: 1,
          ease: "elastic(0.93, 0.35)",
        });
      },
    });

    gsap.set(sliderSVG, { visibility: "visible" });
    onDrag();
  }

  // ===================== KHỞI TẠO TẤT CẢ =====================
  initTree();
  initSlider();
}
