import { ReactNode } from "react";
import { SmallBtn } from "../Backdrop";
import { Palette } from "../../../types/Palette";
import { POSTER } from "../tokens";

interface BasePickerProps {
  ink: string;
  isMobile: boolean;
  palette: Palette;
  label: string;
  value: string;
  onChange: (hex: string) => void;
  children?: ReactNode;
}

// A labelled colour input (swatch + hex field) with a row of buttons to pluck
// the value from the current palette. `children` slot in below it (the harmony
// space toggle, the mix steps/space/curve toggles, the effects blend modes…).
export const BasePicker = ({
  ink,
  isMobile,
  palette,
  label,
  value,
  onChange,
  children,
}: BasePickerProps) => (
  <div
    style={{
      padding: "14px 16px",
      borderBottom: `2px solid ${ink}`,
      flexShrink: 0,
    }}
  >
    <div
      style={{
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: "0.12em",
        marginBottom: 8,
      }}
    >
      {label}
    </div>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div
        style={{
          width: 36,
          height: 36,
          background: value,
          border: `2px solid ${ink}`,
          flexShrink: 0,
        }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          fontFamily: POSTER.mono,
          fontSize: 14,
          padding: isMobile ? "10px 12px" : "6px 10px",
          border: `2px solid ${ink}`,
          background: "transparent",
          color: ink,
          flex: 1,
          outline: "none",
          minHeight: isMobile ? 44 : undefined,
        }}
      />
    </div>
    {palette.length > 0 && (
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        {palette.map((c) => (
          <button
            key={c.dataId}
            onClick={() => onChange(c.hex)}
            aria-label={`use ${c.hex}`}
            style={{
              flex: 1,
              height: isMobile ? 44 : 24,
              background: c.hex,
              border:
                value === c.hex ? `2px solid ${ink}` : "2px solid transparent",
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          />
        ))}
      </div>
    )}
    {children}
  </div>
);

interface SwatchRowProps {
  ink: string;
  isMobile: boolean;
  colors: string[];
  swatchHeight: number;
  onUse: () => void;
  children: ReactNode;
}

// A result row: the swatch strip + a label (in `children`) + a USE button.
export const SwatchRow = ({
  ink,
  isMobile,
  colors,
  swatchHeight,
  onUse,
  children,
}: SwatchRowProps) => (
  <div style={{ marginBottom: 14, border: `2px solid ${ink}` }}>
    <div style={{ display: "flex", height: swatchHeight }}>
      {colors.map((h, i) => (
        <div key={i} style={{ flex: 1, background: h }} />
      ))}
    </div>
    <div
      style={{
        padding: "10px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
        borderTop: `2px solid ${ink}`,
      }}
    >
      {children}
      <SmallBtn ink={ink} tall={isMobile} onClick={onUse}>
        USE
      </SmallBtn>
    </div>
  </div>
);

interface ToggleProps {
  ink: string;
  active: boolean;
  tall: boolean;
  onClick: () => void;
  children: ReactNode;
}

// A pick-one-of-a-small-set pill. Auto-width — meant to flow inside a
// `pillRowStyle()` row that wraps, so a set of options reads as a pill strip
// rather than a stack of full-width header bars. Active = filled with `ink`
// (inverted text); inactive = `1px` outlined. `nowrap` keeps a label on one line.
export const Toggle = ({
  ink,
  active,
  tall,
  onClick,
  children,
}: ToggleProps) => {
  const invert = ink === POSTER.ink ? POSTER.bg : POSTER.ink;
  return (
    <button
      onClick={onClick}
      style={{
        flex: "0 0 auto",
        padding: tall ? "11px 14px" : "6px 11px",
        minHeight: tall ? 44 : undefined,
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        border: `1px solid ${ink}`,
        borderRadius: 0,
        background: active ? ink : "transparent",
        color: active ? invert : ink,
        cursor: "pointer",
        touchAction: "manipulation",
      }}
    >
      {children}
    </button>
  );
};

// A labelled `<input type="range">` with `min/max/step` from a meta object.
export const RangeRow = ({
  ink,
  label,
  meta,
  value,
  onChange,
}: {
  ink: string;
  label: string;
  meta: { min: number; max: number; step: number };
  value: number;
  onChange: (v: number) => void;
}) => (
  <div style={{ marginBottom: 8 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: 9,
        letterSpacing: "0.1em",
        marginBottom: 2,
      }}
    >
      <span>{label}</span>
      <span style={{ fontFamily: POSTER.mono, fontWeight: 400 }}>
        {value.toFixed(meta.step < 0.01 ? 3 : 2)}
      </span>
    </div>
    <input
      type="range"
      min={meta.min}
      max={meta.max}
      step={meta.step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ width: "100%", accentColor: ink }}
    />
  </div>
);
