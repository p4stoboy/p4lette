import { ReactNode } from "react";
import { paletteStats } from "../../../functions/palette_stats";
import { POSTER } from "../tokens";

interface Props {
  hexes: string[];
}

const Chip = ({ hex }: { hex: string }) =>
  hex ? (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 12,
          height: 12,
          background: hex,
          border: "1px solid currentColor",
          display: "inline-block",
        }}
      />
      <span style={{ fontFamily: POSTER.mono, fontSize: 11 }}>
        {hex.toUpperCase()}
      </span>
    </span>
  ) : (
    <span style={{ opacity: 0.4 }}>—</span>
  );

const Row = ({ label, value }: { label: string; value: ReactNode }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 14,
      padding: "8px 0",
    }}
  >
    <span
      style={{
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: 9,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        opacity: 0.55,
      }}
    >
      {label}
    </span>
    <span style={{ fontFamily: POSTER.mono, fontSize: 12, textAlign: "right" }}>
      {value}
    </span>
  </div>
);

// A "palette at a glance" readout — every figure derived purely from the hexes.
export const ShareStats = ({ hexes }: Props) => {
  const s = paletteStats(hexes);
  const grade =
    s.worstContrast.ratio >= 4.5
      ? "AA"
      : s.worstContrast.ratio >= 3
        ? "AA Lg"
        : "fail";
  return (
    <div
      style={{
        padding: "6px 18px 14px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Row label="colours" value={hexes.length} />
      <Row label="avg lightness" value={`${Math.round(s.avgLightness)}%`} />
      <Row label="hue spread" value={`${Math.round(s.hueSpreadDeg)}°`} />
      <Row label="warm / cool" value={`${s.warmCount} / ${s.coolCount}`} />
      <Row label="most vivid" value={<Chip hex={s.mostSaturated} />} />
      <Row label="least vivid" value={<Chip hex={s.leastSaturated} />} />
      <Row
        label="worst contrast"
        value={`${s.worstContrast.ratio.toFixed(2)}:1 · ${grade}`}
      />
    </div>
  );
};
