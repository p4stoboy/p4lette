import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import { ColorCardProps } from "../../types/ColorCardProps";
import { hexToHsl, hslToHex } from "../../functions/color_converters";
import { TERMINAL } from "./tokens";

interface Props {
  color: ColorCardProps;
  fontColor: string;
  onUpdate: (hex: string) => void;
  onClose: () => void;
}

export const TerminalEditTray = ({
  color,
  fontColor,
  onUpdate,
  onClose,
}: Props) => {
  const [hex, setHex] = useState(color.hex);
  const trayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const oc = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node))
        onClose();
    };
    const t = window.setTimeout(
      () => document.addEventListener("mousedown", oc),
      0,
    );
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", oc);
    };
  }, [onClose]);

  const apply = (h: string) => {
    setHex(h);
    onUpdate(h);
  };
  const hsl = hexToHsl(hex);

  const onHexInput = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setHex(v);
    if (/^#[0-9a-f]{6}$/i.test(v)) onUpdate(v);
  };

  return (
    <div
      ref={trayRef}
      style={{
        position: "absolute",
        inset: 0,
        background: hex,
        color: fontColor,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        animation: "brutSlide .18s steps(4)",
        borderLeft: `2px solid ${fontColor}`,
        borderRight: `2px solid ${fontColor}`,
      }}
    >
      <style>{`@keyframes brutSlide { from {transform:translateY(8%); opacity:0;} to{transform:translateY(0); opacity:1;}}`}</style>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: `1px dashed ${fontColor}`,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.14em",
        }}
      >
        <span>&gt; EDITING_</span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: `1px solid ${fontColor}`,
            color: fontColor,
            width: 22,
            height: 22,
            cursor: "pointer",
            fontSize: 12,
            fontFamily: TERMINAL.mono,
          }}
        >
          ×
        </button>
      </div>

      <BrutField label="HEX">
        <input
          value={hex}
          onChange={onHexInput}
          style={{
            fontFamily: TERMINAL.mono,
            fontSize: 14,
            fontWeight: 600,
            background: "transparent",
            border: `1px solid ${fontColor}`,
            color: fontColor,
            padding: "4px 8px",
            width: "100%",
            outline: "none",
          }}
        />
      </BrutField>

      <BrutSlider
        label="H"
        value={hsl.h}
        max={360}
        fontColor={fontColor}
        onChange={(v) => apply(hslToHex({ ...hsl, h: v }))}
      />
      <BrutSlider
        label="S"
        value={hsl.s}
        max={100}
        fontColor={fontColor}
        onChange={(v) => apply(hslToHex({ ...hsl, s: v }))}
      />
      <BrutSlider
        label="L"
        value={hsl.l}
        max={100}
        fontColor={fontColor}
        onChange={(v) => apply(hslToHex({ ...hsl, l: v }))}
      />

      <div
        style={{
          marginTop: 8,
          fontSize: 10,
          opacity: 0.7,
          letterSpacing: "0.12em",
        }}
      >
        // CLICK OUTSIDE TO CLOSE
      </div>
    </div>
  );
};

interface FieldProps {
  label: string;
  children: ReactNode;
}

const BrutField = ({ label, children }: FieldProps) => (
  <div style={{ marginBottom: 10 }}>
    <div
      style={{
        fontSize: 10,
        letterSpacing: "0.14em",
        fontWeight: 700,
        marginBottom: 4,
      }}
    >
      {label}
    </div>
    {children}
  </div>
);

interface SliderProps {
  label: string;
  value: number;
  max: number;
  fontColor: string;
  onChange: (v: number) => void;
}

const BrutSlider = ({
  label,
  value,
  max,
  fontColor,
  onChange,
}: SliderProps) => (
  <div style={{ marginBottom: 8 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 10,
        letterSpacing: "0.14em",
        fontWeight: 700,
        marginBottom: 3,
      }}
    >
      <span>{label}</span>
      <span>
        {Math.round(value)}/{max}
      </span>
    </div>
    <input
      type="range"
      min={0}
      max={max}
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      style={{ width: "100%", accentColor: fontColor }}
    />
  </div>
);
