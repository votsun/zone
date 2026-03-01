"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface FadeContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onComplete"> {
  children: React.ReactNode;
  container?: Element | string | null;
  blur?: boolean;
  duration?: number;
  ease?: string;
  /** Alias for ease (e.g. "ease-out" → power2.out) */
  easing?: string;
  delay?: number;
  threshold?: number;
  initialOpacity?: number;
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const normalizeEase = (e: string): string => {
  if (e === "ease-out") return "power2.out";
  if (e === "ease-in") return "power2.in";
  if (e === "ease-in-out") return "power2.inOut";
  return e;
};

const getSeconds = (val: number): number =>
  typeof val === "number" && val > 10 ? val / 1000 : val;

export default function FadeContent({
  children,
  container,
  blur = false,
  duration = 1000,
  ease: easeProp = "power2.out",
  easing,
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = "power2.in",
  onComplete,
  onDisappearanceComplete,
  className = "",
  style,
  ...props
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ease = normalizeEase(easing ?? easeProp);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let scrollerTarget: Element | null =
      container ?? document.getElementById("snap-main-container") ?? null;
    if (typeof scrollerTarget === "string") {
      scrollerTarget = document.querySelector(scrollerTarget);
    }

    const startPct = (1 - threshold) * 100;

    gsap.set(el, {
      autoAlpha: initialOpacity,
      filter: blur ? "blur(10px)" : "blur(0px)",
      willChange: "opacity, filter, transform",
    });

    const tl = gsap.timeline({
      paused: true,
      delay: getSeconds(delay),
      onComplete: () => {
        onComplete?.();
        if (disappearAfter > 0) {
          gsap.to(el, {
            autoAlpha: initialOpacity,
            filter: blur ? "blur(10px)" : "blur(0px)",
            delay: getSeconds(disappearAfter),
            duration: getSeconds(disappearDuration),
            ease: disappearEase,
            onComplete: () => onDisappearanceComplete?.(),
          });
        }
      },
    });

    tl.to(el, {
      autoAlpha: 1,
      filter: "blur(0px)",
      duration: getSeconds(duration),
      ease,
    });

    const st = ScrollTrigger.create({
      trigger: el,
      scroller: (scrollerTarget as gsap.DOMTarget) ?? window,
      start: `top ${startPct}%`,
      once: true,
      onEnter: () => tl.play(),
    });

    return () => {
      st.kill();
      tl.kill();
      gsap.killTweensOf(el);
    };
  }, [
    container,
    blur,
    duration,
    easeProp,
    easing,
    delay,
    threshold,
    initialOpacity,
    disappearAfter,
    disappearDuration,
    disappearEase,
    onComplete,
    onDisappearanceComplete,
  ]);

  return (
    <div ref={ref} className={className} style={style} {...props}>
      {children}
    </div>
  );
}
