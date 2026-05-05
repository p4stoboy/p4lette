import { CSSProperties, MouseEvent, ReactNode, useState } from "react";
import { TERMINAL } from "./tokens";

interface BackdropProps {
  children: ReactNode;
  onClose: () => void;
  align?: "center" | "right" | "bottom";
}

export const BrutBackdrop = ({
  children,
  onClose,
  align = "center",
}: BackdropProps) => {
  const wrapStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems:
      align === "right" ? "stretch" : align === "bottom" ? "flex-end" : "center",
    justifyContent: align === "right" ? "flex-end" : "center",
    zIndex: 100,
    animation: "brutFade .14s linear",
  };
  return (
    <div onClick={onClose} style={wrapStyle}>
      <style>{`@keyframes brutFade { from { opacity: 0; } to { opacity: 1; } }`}</style>
      {children}
    </div>
  );
};

interface SmallBtnProps {
  ink: string;
  accent: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  tall?: boolean;
}

export const BrutSmallBtn = ({
  ink,
  accent,
  onClick,
  children,
  tall,
}: SmallBtnProps) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: TERMINAL.mono,
        fontWeight: 700,
        fontSize: tall ? 12 : 10,
        letterSpacing: "0.1em",
        padding: tall ? "10px 16px" : "3px 8px",
        minHeight: tall ? 44 : undefined,
        border: `${TERMINAL.borderW}px solid ${ink}`,
        background: hov ? accent : "transparent",
        color: hov ? "#000" : ink,
        cursor: "pointer",
        touchAction: "manipulation",
      }}
    >
      {children}
    </button>
  );
};
