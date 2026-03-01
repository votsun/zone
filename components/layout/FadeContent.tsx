"use client";

import { useEffect, useRef, useState } from "react";

interface FadeContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onComplete"> {
  children: React.ReactNode;
  container?: Element | string | null;
  /** When true, animate on mount instead of on scroll (e.g. for modals) */
  playOnMount?: boolean;
  blur?: boolean;
  duration?: number;
  ease?: string;
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

const getSeconds = (val: number): number =>
  typeof val === "number" && val > 10 ? val / 1000 : val;

export default function FadeContent({
  children,
  container,
  playOnMount = false,
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimeout = window.setTimeout(() => {
      setVisible(true);
      onComplete?.();
    }, getSeconds(delay) * 1000);

    let hideTimeout: number | undefined;
    if (disappearAfter > 0) {
      hideTimeout = window.setTimeout(() => {
        setVisible(false);
        onDisappearanceComplete?.();
      }, (getSeconds(delay) + getSeconds(disappearAfter)) * 1000);
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

    if (playOnMount) {
      tl.play();
      return () => {
        tl.kill();
        gsap.killTweensOf(el);
      };
    }

    const st = ScrollTrigger.create({
      trigger: el,
      scroller: (scrollerTarget as gsap.DOMTarget) ?? window,
      start: `top ${startPct}%`,
      once: true,
      onEnter: () => tl.play(),
    });

    return () => {
      window.clearTimeout(showTimeout);
      if (hideTimeout) window.clearTimeout(hideTimeout);
    };
  }, [
    playOnMount,
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
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : initialOpacity,
        filter: blur ? (visible ? "blur(0px)" : "blur(10px)") : undefined,
        transition: `opacity ${getSeconds(duration)}s ease, filter ${getSeconds(duration)}s ease`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
