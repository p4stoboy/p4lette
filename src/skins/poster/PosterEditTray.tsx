import { ChangeEvent, useEffect, useRef, useState } from "react";
import { usePalette } from "../../context/PaletteContext";
import { ColorCardProps } from "../../types/ColorCardProps";
import { ColorMode, EditSpace } from "../../types/Colors";
import {
  formatColor,
  hexToHsl,
  hexToHsv,
  hexToOklch,
  hexToOkhsl,
  hexToRgb,
  hslToHex,
  hsvToHex,
  oklchToHex,
  okhslToHex,
  rgbToHex,
  parseColor,
} from "../../functions/color_converters";
import { POSTER } from "./tokens";

interface Props {
  color: ColorCardProps;
  fontColor: string;
  onUpdate: (hex: string) => void;
  onClose: () => void;
}

// The colour space the EDIT-tray sliders/text edit in. `"okhsl"` (the
// perceptual default) keeps the old HUE/SAT/LUM behaviour + a hex text input;
// the others map to that space's natural channels.
const EDIT_SPACES: readonly EditSpace[] = [
  "okhsl",
  "rgb",
  "hsl",
  "hsv",
  "oklch",
];

type SliderTriplet = {
  labels: readonly [string, string, string];
  maxes: readonly [number, number, number];
  vals: readonly [number, number, number];
  set: (i: 0 | 1 | 2, v: number) => string;
};

const tripletFor = (space: EditSpace, hex: string): SliderTriplet => {
  switch (space) {
    case "rgb": {
      const { r, g, b } = hexToRgb(hex);
      return {
        labels: ["R", "G", "B"],
        maxes: [255, 255, 255],
        vals: [r, g, b],
        set: (i, v) =>
          rgbToHex(
            i === 0
              ? { r: v, g, b }
              : i === 1
                ? { r, g: v, b }
                : { r, g, b: v },
          ),
      };
    }
    case "hsl": {
      const { h, s, l } = hexToHsl(hex);
      return {
        labels: ["HUE", "SAT", "LUM"],
        maxes: [360, 100, 100],
        vals: [h, s, l],
        set: (i, v) =>
          hslToHex(
            i === 0
              ? { h: v, s, l }
              : i === 1
                ? { h, s: v, l }
                : { h, s, l: v },
          ),
      };
    }
    case "hsv": {
      const { h, s, v: val } = hexToHsv(hex);
      return {
        labels: ["HUE", "SAT", "VAL"],
        maxes: [360, 100, 100],
        vals: [h, s, val],
        set: (i, v) =>
          hsvToHex(
            i === 0
              ? { h: v, s, v: val }
              : i === 1
                ? { h, s: v, v: val }
                : { h, s, v },
          ),
      };
    }
    case "oklch": {
      const { l, c, h } = hexToOklch(hex);
      return {
        labels: ["LUM", "CHR", "HUE"],
        maxes: [100, 40, 360],
        vals: [l, c * 100, h],
        set: (i, v) =>
          oklchToHex(
            i === 0
              ? { l: v, c, h }
              : i === 1
                ? { l, c: v / 100, h }
                : { l, c, h: v },
          ),
      };
    }
    default: {
      const o = hexToOkhsl(hex);
      return {
        labels: ["HUE", "SAT", "LUM"],
        maxes: [360, 100, 100],
        vals: [o.h, o.s * 100, o.l * 100],
        set: (i, v) =>
          okhslToHex(
            i === 0
              ? { h: v, s: o.s, l: o.l }
              : i === 1
                ? { h: o.h, s: v / 100, l: o.l }
                : { h: o.h, s: o.s, l: v / 100 },
          ),
      };
    }
  }
};

export const PosterEditTray = ({
  color,
  fontColor,
  onUpdate,
  onClose,
}: Props) => {
  const { editSpace, setEditSpace } = usePalette();
  // Okhsl has no compact CSS string, so its text field is just a hex field.
  const textMode: ColorMode = editSpace === "okhsl" ? "hex" : editSpace;
  const [hex, setHex] = useState(color.hex);
  const [input, setInput] = useState(() => formatColor(color.hex, textMode));
  const trayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInput(formatColor(hex, textMode));
  }, [textMode, hex]);

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

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInput(v);
    const parsed = parseColor(v, textMode);
    if (parsed) {
      setHex(parsed);
      onUpdate(parsed);
    }
  };

  const t = tripletFor(editSpace, hex);

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
          gap: 8,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily: POSTER.display,
              fontSize: 22,
              letterSpacing: "-0.02em",
            }}
          >
            EDIT
          </span>
          <select
            value={editSpace}
            onChange={(e) => setEditSpace(e.target.value as EditSpace)}
            aria-label="edit colour space"
            style={{
              background: "transparent",
              border: `1px solid ${fontColor}`,
              color: fontColor,
              fontFamily: POSTER.body,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "3px 4px",
              cursor: "pointer",
            }}
          >
            {EDIT_SPACES.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>
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
            flexShrink: 0,
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
        {textMode.toUpperCase()}
      </label>
      <input
        value={input}
        onChange={onInput}
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

      {([0, 1, 2] as const).map((i) => (
        <ChannelSlider
          key={i}
          label={t.labels[i]}
          min={0}
          max={t.maxes[i]}
          value={t.vals[i]}
          fontColor={fontColor}
          onChange={(v) => apply(t.set(i, v))}
        />
      ))}

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
          {[0, 60, 120, 180, 240, 300].map((h) => {
            const swatch = okhslToHex({ h, s: 0.82, l: 0.62 });
            return (
              <button
                key={h}
                onClick={() => apply(swatch)}
                style={{
                  height: 24,
                  background: swatch,
                  border: `2px solid ${fontColor}`,
                  cursor: "pointer",
                }}
              />
            );
          })}
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
