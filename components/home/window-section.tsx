"use client";

import { useRef, useEffect, useState } from "react";
import { useScroll, useTransform } from "motion/react";
import { SceneLayer } from "./scene-layer";
import { SceneContent } from "./scene-content";

const SCENES = [
  {
    image: "/images/scene-1-clouds.webp",
    title: "规划你的下一次完美旅行",
    subtitle: "从云端俯瞰，开启你的旅程",
    showCta: true,
  },
  {
    image: "/images/scene-2-mountains.webp",
    title: "穿越云层，遇见山川",
    subtitle: "智能行程编排，让每一步都扎实",
  },
  {
    image: "/images/scene-3-coast.webp",
    title: "沿着海岸线，追逐日落",
    subtitle: "灵活调整路线，随心而行",
  },
  {
    image: "/images/scene-4-city.webp",
    title: "抵达目的地，点亮城市",
    subtitle: "AI 推荐，发现属于你的角落",
    showCta: true,
  },
];

export function WindowSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Each scene occupies ~22% of the scroll range with transition zones:
  // 0-3%: scene 0 fades in; 19-25%: scene 0→1 crossfade
  // 25%-28%: scene 1 fully in; 47-53%: scene 1→2 crossfade
  // 50-53%: scene 2 fully in; 72-78%: scene 2→3 crossfade
  // 75-78%: scene 3 fully in; 94-100%: window dissolves

  const t = 0.03; // transition width

  const p0 = 0;
  const p1 = 0.25;
  const p2 = 0.5;
  const p3 = 0.75;
  const pEnd = 1;

  const createSceneTransforms = (center: number, prevCenter: number, nextCenter: number) => {
    const fadeInStart = prevCenter < 0 ? 0 : center - t;
    const fadeInEnd = center + t * 0.5;
    const fadeOutStart = nextCenter > 1 ? 1 : nextCenter - t;
    const fadeOutEnd = nextCenter > 1 ? 1 : nextCenter;

    const opacity = reducedMotion
      ? useTransform(scrollYProgress, [0, 1], [1, 1]) // just show first scene
      : useTransform(
          scrollYProgress,
          [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
          center === p0 ? [1, 1, 0, 0] : [0, 1, 1, 0]
        );

    const scale = reducedMotion
      ? useTransform(scrollYProgress, [0, 1], [1, 1])
      : useTransform(
          scrollYProgress,
          [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
          [0.92, 1, 1, 0.92]
        );

    return { opacity, scale };
  };

  const sceneTransforms = [
    createSceneTransforms(p0, -t, p1),
    createSceneTransforms(p1, p0, p2),
    createSceneTransforms(p2, p1, p3),
    createSceneTransforms(p3, p2, pEnd),
  ];

  // Content opacity — tighter transitions than images to avoid text overlap
  const contentTransforms = SCENES.map((_, i) => {
    const center = [p0, p1, p2, p3][i];
    const prev = i === 0 ? -t : [p0, p1, p2][i - 1];
    const next = i === 3 ? pEnd + t : [p1, p2, p3][i];
    const crossfadeWidth = 0.015; // tight text crossfade

    // Content visible from midpoint-to-midpoint, with short crossfades
    const fadeInStart = i === 0 ? 0 : (prev + center) / 2;
    const fadeOutStart = i === 3 ? 1 : (center + next) / 2;

    return {
      opacity: reducedMotion
        ? useTransform(scrollYProgress, [0, 1], [1, 1])
        : useTransform(
            scrollYProgress,
            [
              fadeInStart,
              fadeInStart + crossfadeWidth,
              fadeOutStart - crossfadeWidth,
              fadeOutStart,
            ],
            i === 0 ? [1, 1, 0, 0] : [0, 1, 1, 0]
          ),
    };
  });

  return (
    <div ref={containerRef} className="relative" style={{ height: "300vh" }}>
      {/* Sticky window container */}
      <div className="sticky top-0 h-screen overflow-hidden bg-[#060a10]">
        {/* Scene images stacked */}
        {SCENES.map((scene, i) => (
          <SceneLayer
            key={i}
            src={scene.image}
            opacity={sceneTransforms[i].opacity}
            scale={sceneTransforms[i].scale}
          />
        ))}

        {/* Scene text content */}
        {SCENES.map((scene, i) => (
          <SceneContent
            key={i}
            title={scene.title}
            subtitle={scene.subtitle}
            opacity={contentTransforms[i].opacity}
            showCta={scene.showCta}
          />
        ))}
      </div>
    </div>
  );
}
