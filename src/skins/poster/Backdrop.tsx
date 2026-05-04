import { CSSProperties, MouseEvent, ReactNode, useState } from "react";
import { POSTER } from "./tokens";

interface BackdropProps {
  children: ReactNode;
  onClose: () => void;
  align?: "center" | "right" | "bottom";
}

export const Backdrop = ({
  children,
  onClose,
  align = "center",
}: BackdropProps) => {
  const wrapStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "rgba(14,11,8,0.5)",
    display: "flex",
    alignItems:
      align === "right" ? "stretch" : align === "bottom" ? "flex-end" : "center",
    justifyContent: align === "right" ? "flex-end" : "center",
    zIndex: 100,
    animation: "maxFadeIn .18s ease",
  };
  return (
    <div onClick={onClose} style={wrapStyle}>
      <style>{`@keyframes maxFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      {children}
    </div>
  );
};

interface SmallBtnProps {
  ink: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  tall?: boolean;
}

export const SmallBtn = ({ ink, onClick, children, tall }: SmallBtnProps) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: tall ? 12 : 10,
        letterSpacing: "0.1em",
        padding: tall ? "12px 18px" : "5px 10px",
        minHeight: tall ? 44 : undefined,
        border: `2px solid ${ink}`,
        background: hov ? ink : "transparent",
        color: hov ? POSTER.bg : ink,
        cursor: "pointer",
        touchAction: "manipulation",
      }}
    >
      {children}
    </button>
  );
};
