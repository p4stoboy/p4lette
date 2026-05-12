import { CSSProperties, useState } from "react";
import {
  EXPORT_PRESETS,
  resolveTemplate,
} from "../../../functions/resolve_export_template";
import { Palette } from "../../../types/Palette";
import { POSTER } from "../tokens";

interface Props {
  ink: string;
  hexes: string[];
  names: string[] | null;
}

// Grab the palette as code, straight from the share page — reuses the editor's
// pure template resolver + built-in presets. Re-renders when SHOW NAMES fires.
export const ShareExport = ({ ink, hexes, names }: Props) => {
  const [presetKey, setPresetKey] = useState(EXPORT_PRESETS[0].key);
  const [copied, setCopied] = useState(false);
  const preset =
    EXPORT_PRESETS.find((p) => p.key === presetKey) ?? EXPORT_PRESETS[0];
  const palette: Palette = hexes.map((h, i) => ({
    id: i,
    hex: h,
    locked: false,
    dataId: `share-${i}`,
  }));
  const out = resolveTemplate(
    preset.body,
    palette,
    names ?? hexes.map((h) => h.toUpperCase()),
  );
  const copy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(out).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  };
  const chip = (active: boolean): CSSProperties => ({
    fontFamily: POSTER.body,
    fontWeight: 700,
    fontSize: 9,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "5px 8px",
    border: `1px solid ${ink}`,
    background: active ? ink : "transparent",
    color: active ? POSTER.bg : ink,
    cursor: "pointer",
  });
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {EXPORT_PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPresetKey(p.key)}
            style={chip(p.key === presetKey)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 130,
          border: `1px solid ${ink}`,
          overflow: "hidden",
        }}
      >
        <pre
          style={{
            margin: 0,
            padding: 12,
            height: "100%",
            overflow: "auto",
            fontFamily: POSTER.mono,
            fontSize: 11,
            lineHeight: 1.5,
            whiteSpace: "pre",
          }}
        >
          {out}
        </pre>
        <button
          onClick={copy}
          style={{
            ...chip(false),
            position: "absolute",
            top: 8,
            right: 8,
            background: POSTER.bg,
          }}
        >
          {copied ? "COPIED ✓" : "COPY"}
        </button>
      </div>
    </div>
  );
};
