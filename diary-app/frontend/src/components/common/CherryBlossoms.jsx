import { useMemo } from "react";

// ── 꽃잎 SVG 경로 (눈물방울/꽃잎 형태) ──────────────────────
const PETAL_PATH =
  "M0,-5 C2.5,-5 4.5,-2 3.5,1 C2.5,4 0,5.5 0,5.5 C0,5.5 -2.5,4 -3.5,1 C-4.5,-2 -2.5,-5 0,-5 Z";

const COLORS = ["#fdddf0", "#f4a7c9", "#ffffff"];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// ── 꽃잎 1개 컴포넌트 ─────────────────────────────────────────
function Petal({ id, left, size, duration, spinDuration, delay, color, sway }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: `${left}%`,
        animation: `cherry-fall-${id} ${duration}s ${delay}s infinite linear`,
        willChange: "transform, opacity",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="-6 -7 12 14"
        aria-hidden="true"
        style={{
          display: "block",
          animation: `cherry-spin ${spinDuration}s linear infinite`,
          willChange: "transform",
        }}
      >
        <path
          d={PETAL_PATH}
          fill={color}
          fillOpacity={color === "#ffffff" ? 0.75 : 0.88}
          stroke={color === "#ffffff" ? "#f4a7c9" : "none"}
          strokeWidth={0.6}
          strokeOpacity={0.35}
        />
      </svg>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function CherryBlossoms({ count = 25 }) {
  const petals = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const sway = rand(20, 55) * (Math.random() > 0.5 ? 1 : -1);
      return {
        id: i,
        left: rand(1, 99),
        size: rand(8, 16),
        duration: rand(9, 16),
        spinDuration: rand(3, 7),
        // 음수 delay → 컴포넌트 마운트 시 이미 진행 중인 것처럼 보임
        delay: rand(-15, 1),
        sway,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    });
  }, [count]);

  // 각 꽃잎마다 고유 sway 값을 가진 keyframe을 생성
  const keyframesCSS = [
    // 공유 spin 애니메이션
    `@keyframes cherry-spin {
       from { transform: rotate(0deg); }
       to   { transform: rotate(360deg); }
     }`,
    // 꽃잎별 fall 애니메이션 (sway 값 개별 지정)
    ...petals.map(
      (p) => `
      @keyframes cherry-fall-${p.id} {
        0%   { transform: translateY(-20px) translateX(0px);                opacity: 0;   }
        6%   { opacity: 1; }
        28%  { transform: translateY(26vh) translateX(${p.sway}px);         opacity: 1;   }
        52%  { transform: translateY(52vh) translateX(${-p.sway * 0.65}px); opacity: 1;   }
        76%  { transform: translateY(76vh) translateX(${p.sway * 0.45}px);  opacity: 0.9; }
        93%  { opacity: 0.6; }
        100% { transform: translateY(108vh) translateX(0px);                opacity: 0;   }
      }`
    ),
  ].join("\n");

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {petals.map((p) => (
          <Petal key={p.id} {...p} />
        ))}
      </div>
    </>
  );
}
