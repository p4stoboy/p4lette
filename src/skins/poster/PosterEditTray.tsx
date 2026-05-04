import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ColorCardProps } from "../../types/ColorCardProps";
import { hexToHsl, hslToHex } from "../../functions/color_converters";
import { POSTER } from "./tokens";

interface Props {
  color: ColorCardProps;
  fontColor: string;
  onUpdate: (hex: string) => void;
  onClose: () => void;
}

export const PosterEditTray = ({
  color,
  fontColor,
  onUpdate,
  onClose,
}: Props) => {
  const [hex, setHex] = useState(color.hex);
  const trayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node))
        onClose();
    };
    const t = window.setTimeout(
      () => document.addEventListener("mousedown", onClick),
      0,
    );
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onClick);
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
        padding: 24,
        display: "flex",
        flexDirection: "column",
        animation: "maxSlideIn .22s cubic-bezier(.2,.7,.3,1)",
      }}
    >
      <style>{`@keyframes maxSlideIn { from {transform: translateY(8%); opacity:0;} to{transform:translateY(0); opacity:1;} }`}</style>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontFamily: POSTER.display,
            fontSize: 22,
            letterSpacing: "-0.02em",
          }}
        >
          EDIT
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: `2px solid ${fontColor}`,
            color: fontColor,
            width: 28,
            height: 28,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          ×
        </button>
      </div>

      <label
        style={{
          fontFamily: POSTER.body,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: "0.12em",
          marginBottom: 4,
        }}
      >
        HEX
      </label>
      <input
        value={hex}
        onChange={onHexInput}
        style={{
          fontFamily: POSTER.mono,
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: "0.04em",
          background: "transparent",
          border: "none",
          borderBottom: `2px solid ${fontColor}`,
          color: fontColor,
          padding: "4px 0",
          marginBottom: 16,
          outline: "none",
        }}
      />

      <ChannelSlider
        label="HUE"
        min={0}
        max={360}
        value={hsl.h}
        fontColor={fontColor}
        onChange={(v) => apply(hslToHex({ ...hsl, h: v }))}
      />
      <ChannelSlider
        label="SAT"
        min={0}
        max={100}
        value={hsl.s}
        fontColor={fontColor}
        onChange={(v) => apply(hslToHex({ ...hsl, s: v }))}
      />
      <ChannelSlider
        label="LUM"
        min={0}
        max={100}
        value={hsl.l}
        fontColor={fontColor}
        onChange={(v) => apply(hslToHex({ ...hsl, l: v }))}
      />

      <div style={{ marginTop: 8 }}>
        <div
          style={{
            fontFamily: POSTER.body,
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: "0.12em",
            marginBottom: 4,
          }}
        >
          QUICK
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6,1fr)",
            gap: 4,
          }}
        >
          {[0, 60, 120, 180, 240, 300].map((h) => (
            <button
              key={h}
              onClick={() => apply(hslToHex({ h, s: 70, l: 55 }))}
              style={{
                height: 24,
                background: hslToHex({ h, s: 70, l: 55 }),
                border: `2px solid ${fontColor}`,
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface SliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  fontColor: string;
  onChange: (v: number) => void;
}

const ChannelSlider = ({
  label,
  min,
  max,
  value,
  fontColor,
  onChange,
}: SliderProps) => (
  <div style={{ marginBottom: 12 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 4,
      }}
    >
      <span
        style={{
          fontFamily: POSTER.body,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: "0.12em",
        }}
      >
        {label}
      </span>
      <span style={{ fontFamily: POSTER.mono, fontSize: 11 }}>
        {Math.round(value)}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      style={{ width: "100%", accentColor: fontColor }}
    />
  </div>
);
