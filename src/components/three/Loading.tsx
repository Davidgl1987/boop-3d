import { Html } from "@react-three/drei";

const LETTERS = "Cargando...".split("");

export const Loading = () => (
  <Html center>
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <div className="flex items-end gap-0.5">
        {LETTERS.map((char, i) => (
          <span
            key={i}
            className="text-5xl font-black text-black inline-block leading-none"
            style={{
              animationName: "loadingBounce",
              animationDuration: "0.7s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDirection: "alternate",
              animationDelay: `${i * 0.06}s`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes loadingBounce {
          from { transform: translateY(0px);   opacity: 1;   }
          to   { transform: translateY(-18px); opacity: 0.5; }
        }
      `}</style>
    </div>
  </Html>
);
