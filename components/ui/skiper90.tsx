"use client";

import type { MotionValue } from "motion";
import { motion, useMotionValue, useTransform } from "motion/react";
import {
  type ReactNode,
  type RefObject,
  Children,
  isValidElement,
  useLayoutEffect,
  useRef,
} from "react";

import { cn } from "@/lib/utils";

const Skiper90 = () => {
  return (
    <div>
      <div className="-mt-10 mb-24 grid content-start justify-items-center gap-6 text-center">
        <span className="after:to-foreground relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-transparent after:content-['']">
          hover the card to see the gradient
        </span>
      </div>
      <div className="relative grid max-w-4xl grid-cols-1 gap-2 p-2 md:grid-cols-2">
        <SkiperGradiantCard className="p-1">
          <GradiantCardBody>
            <div className="relative flex h-full w-full items-center justify-center">
              <img
                src="https://cdn.skiper-ui.com/images/templates/bg1.svg"
                alt=""
                className="h-full w-full rounded-2xl object-cover dark:invert"
              />
              <img
                src="https://cdn.skiper-ui.com/images/templates/Aa0.svg"
                alt=""
                className="group-hover:scale-120 pointer-events-none absolute h-[55%] w-fit object-cover transition-all duration-300 ease-out dark:invert"
              />
            </div>
          </GradiantCardBody>
          <GradiantCardTitle>November 005</GradiantCardTitle>
        </SkiperGradiantCard>
        <SkiperGradiantCard className="p-1">
          <GradiantCardBody>
            <div className="relative flex h-full w-full items-center justify-center">
              <img
                src="https://cdn.skiper-ui.com/images/templates/bg2.svg"
                alt=""
                className="h-full w-full rounded-2xl object-cover dark:invert"
              />
              <img
                src="https://cdn.skiper-ui.com/images/templates/Aa2.svg"
                alt=""
                className="group-hover:scale-120 pointer-events-none absolute h-[55%] w-fit object-cover invert transition-all duration-300 ease-out dark:invert-0"
              />
            </div>
          </GradiantCardBody>
          <GradiantCardTitle>November 005</GradiantCardTitle>
        </SkiperGradiantCard>
      </div>
    </div>
  );
};

export { Skiper90 };

const GradiantCardTitle = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <h3
      className={cn(
        "text-base text-neutral-800 dark:text-neutral-300",
        className,
      )}
    >
      {children}
    </h3>
  );
};

const GradiantCardBody = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return <div className={cn("h-full w-full", className)}>{children}</div>;
};

const SkiperGradiantCard = ({
  circleSize = 400,
  className,
  children,
}: {
  circleSize?: number;
  children?: ReactNode;
  className?: string;
}) => {
  const [mouse, parentRef] = useMouse();

  // Extract GradiantCardHeader and GradiantCardBody from children
  let header: ReactNode = null;
  let body: ReactNode = null;

  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.type === GradiantCardTitle) {
        header = child;
      } else if (child.type === GradiantCardBody) {
        body = child;
      }
    }
  });

  return (
    <div
      className="group relative transform-gpu overflow-hidden rounded-[20px] bg-white/10 p-1 transition-transform hover:scale-[1.01] active:scale-90"
      ref={parentRef}
    >
      <motion.div
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2 transform-gpu rounded-full transition-transform duration-500 group-hover:scale-[3]",
          "bg-[linear-gradient(135deg,#3BC4F2,#7A69F9,#F26378,#F5833F)] dark:bg-[linear-gradient(135deg,#fffff,#333333,#666666,#ffffff)] dark:saturate-0",
        )}
        style={{
          maskImage: `radial-gradient(${
            circleSize / 2
          }px circle at center, white, transparent)`,
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          left: mouse.elementLeft,
          top: mouse.elementTop,
          opacity: mouse.opacity,
        }}
      />
      <div className="bg-background/80 absolute inset-px rounded-[19px]" />
      {body && (
        <div
          className={cn(
            "gird bg-background relative place-content-center overflow-hidden rounded-[15px]",
            className,
          )}
        >
          {body}
        </div>
      )}
      {header && <div className="relative px-3 py-2">{header}</div>}
    </div>
  );
};

type MouseMotionState = {
  x: MotionValue<number | null>;
  y: MotionValue<number | null>;
  elementX: MotionValue<number | null>;
  elementY: MotionValue<number | null>;
  elementPositionX: MotionValue<number | null>;
  elementPositionY: MotionValue<number | null>;
  elementLeft: MotionValue<string>;
  elementTop: MotionValue<string>;
  opacity: MotionValue<number>;
};

export function useMouse(
  containerRef?: RefObject<HTMLElement | SVGElement | null>,
): [MouseMotionState, RefObject<HTMLDivElement | null>] {
  const x = useMotionValue<number | null>(null);
  const y = useMotionValue<number | null>(null);
  const elementX = useMotionValue<number | null>(null);
  const elementY = useMotionValue<number | null>(null);
  const elementPositionX = useMotionValue<number | null>(null);
  const elementPositionY = useMotionValue<number | null>(null);

  const elementLeft = useTransform(elementX, (value: number | null) =>
    value === null ? "-9999px" : `${value}px`,
  );
  const elementTop = useTransform(elementY, (value: number | null) =>
    value === null ? "-9999px" : `${value}px`,
  );
  const opacity = useMotionValue<number>(0);

  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const resolveElement = () => {
      if (containerRef?.current instanceof Element) {
        return containerRef.current;
      }

      if (ref.current instanceof Element) {
        return ref.current;
      }

      return null;
    };

    const handleMouseMove = (event: MouseEvent) => {
      x.set(event.pageX);
      y.set(event.pageY);

      const element = resolveElement();
      if (!element) {
        elementX.set(null);
        elementY.set(null);
        elementPositionX.set(null);
        elementPositionY.set(null);
        opacity.set(0);
        return;
      }

      const { left, top } = element.getBoundingClientRect();
      const currentPositionX = left + window.scrollX;
      const currentPositionY = top + window.scrollY;
      const pointerX = event.pageX - currentPositionX;
      const pointerY = event.pageY - currentPositionY;

      elementX.set(pointerX);
      elementY.set(pointerY);
      elementPositionX.set(currentPositionX);
      elementPositionY.set(currentPositionY);
      opacity.set(1);
    };

    const handleMouseLeave = () => {
      x.set(null);
      y.set(null);
      elementX.set(null);
      elementY.set(null);
      elementPositionX.set(null);
      elementPositionY.set(null);
      opacity.set(0);
    };

    document.addEventListener("mousemove", handleMouseMove);
    const element = resolveElement();
    element?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      element?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [
    containerRef,
    elementX,
    elementPositionX,
    elementPositionY,
    elementY,
    opacity,
    ref,
    x,
    y,
  ]);

  return [
    {
      x,
      y,
      elementX,
      elementY,
      elementPositionX,
      elementPositionY,
      elementLeft,
      elementTop,
      opacity,
    },
    ref,
  ];
}
