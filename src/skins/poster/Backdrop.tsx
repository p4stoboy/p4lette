import { CSSProperties, MouseEvent, ReactNode, useState } from "react";
import { POSTER } from "./tokens";

interface BackdropProps {
  children: ReactNode;
  onClose: () => void;
  align?: "center" | "right";
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
    alignItems: align === "right" ? "stretch" : "center",
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
}

export const SmallBtn = ({ ink, onClick, children }: SmallBtnProps) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: "0.1em",
        padding: "5px 10px",
        border: `2px solid ${ink}`,
        background: hov ? ink : "transparent",
        color: hov ? POSTER.bg : ink,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
};
