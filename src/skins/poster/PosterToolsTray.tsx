import { ReactNode, useState } from "react";
import { SmallBtn } from "./Backdrop";
import { Palette } from "../../types/Palette";
import {
  HARMONY_STYLES,
  HarmonyKind,
  PaletteStyle,
  RYB_CUBES,
  harmony,
  harmonyRyb,
} from "../../functions/harmony";
import { TONE_METHODS, tones } from "../../functions/tones";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
  palette: Palette;
  onClose: () => void;
  onApply: (hexes: string[]) => void;
}

type HarmonySpace = "oklch" | "ryb";

const HARMONIES: ReadonlyArray<readonly [string, HarmonyKind]> = [
  ["ANALOGOUS", "analogous"],
  ["COMPLEMENTARY", "complementary"],
  ["TRIADIC", "triadic"],
  ["TETRADIC", "tetradic"],
  ["SPLIT-COMP", "split"],
  ["MONOCHROME", "monochrome"],
  ["SHADES", "shades"],
];

export const PosterToolsTray = ({
  ink,
  bg,
  isMobile,
  palette,
  onClose,
  onApply,
}: Props) => (
  <div
    role="dialog"
    aria-label="tools"
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 55,
      background: bg,
      color: ink,
      display: "flex",
      flexDirection: "column",
      animation: "toolsIn .22s cubic-bezier(.2,.7,.3,1)",
    }}
  >
    <style>{`@keyframes toolsIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

    <div
      style={{
        borderBottom: `${POSTER.borderW}px solid ${ink}`,
        padding: isMobile ? "12px 16px" : "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 14,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span
          style={{
            fontFamily: POSTER.display,
            fontSize: isMobile ? 28 : 34,
            letterSpacing: "-0.02em",
          }}
        >
          TOOLS
        </span>
        {!isMobile && (
          <span
            style={{
              fontFamily: POSTER.body,
              fontSize: 12,
              letterSpacing: "0.1em",
              opacity: 0.6,
            }}
          >
            HARMONY · TONES — pick a seed, hit USE to apply
          </span>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="close"
        style={{
          background: "none",
          border: `2px solid ${ink}`,
          color: ink,
          width: isMobile ? 44 : 34,
          height: isMobile ? 44 : 34,
          cursor: "pointer",
          fontSize: 18,
          fontWeight: 700,
          alignSelf: "center",
          touchAction: "manipulation",
        }}
      >
        ×
      </button>
    </div>

    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        overflowY: isMobile ? "auto" : "hidden",
      }}
    >
      <HarmonyBody
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        onApply={onApply}
      />
      <TonesBody
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        onApply={onApply}
      />
    </div>
  </div>
);

interface BodyProps {
  ink: string;
  isMobile: boolean;
  palette: Palette;
  onApply: (hexes: string[]) => void;
}

const sectionStyle = (ink: string, isMobile: boolean, first: boolean) => ({
  flex: isMobile ? ("0 0 auto" as const) : 1,
  display: "flex" as const,
  flexDirection: "column" as const,
  minWidth: 0,
  minHeight: 0,
  borderRight: !isMobile && first ? `${POSTER.borderW}px solid ${ink}` : "none",
  borderTop: isMobile && !first ? `${POSTER.borderW}px solid ${ink}` : "none",
});

const subHeaderStyle = (ink: string) => ({
  borderBottom: `2px solid ${ink}`,
  padding: "10px 16px",
  fontFamily: POSTER.display,
  fontSize: 20,
  letterSpacing: "-0.01em",
  flexShrink: 0,
});

const rowsStyle = (isMobile: boolean) => ({
  flex: 1,
  overflowY: isMobile ? ("visible" as const) : ("auto" as const),
  padding: 16,
});

const HarmonyBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [base, setBase] = useState(palette[0]?.hex ?? "#ff3d00");
  const [space, setSpace] = useState<HarmonySpace>("oklch");
  const [style, setStyle] = useState<PaletteStyle>("default");
  const [cube, setCube] = useState("itten");
  const variants =
    space === "oklch"
      ? HARMONY_STYLES.map((s) => ({
          key: s,
          label: s,
          active: style === s,
          pick: () => setStyle(s),
        }))
      : RYB_CUBES.map((c) => ({
          key: c.key,
          label: c.label,
          active: cube === c.key,
          pick: () => setCube(c.key),
        }));
  return (
    <div style={sectionStyle(ink, isMobile, true)}>
      <div style={subHeaderStyle(ink)}>HARMONY</div>
      <BasePicker
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        label="BASE COLOR"
        value={base}
        onChange={setBase}
      >
        <div style={{ marginTop: 12, border: `2px solid ${ink}` }}>
          <div style={{ display: "flex" }}>
            <Toggle
              ink={ink}
              active={space === "oklch"}
              tall={isMobile}
              divide
              onClick={() => setSpace("oklch")}
            >
              OKLCH
            </Toggle>
            <Toggle
              ink={ink}
              active={space === "ryb"}
              tall={isMobile}
              onClick={() => setSpace("ryb")}
            >
              RYB
            </Toggle>
          </div>
          <div style={{ display: "flex", borderTop: `2px solid ${ink}` }}>
            {variants.map((v, i) => (
              <Toggle
                key={v.key}
                ink={ink}
                active={v.active}
                tall={isMobile}
                divide={i < variants.length - 1}
                onClick={v.pick}
              >
                {v.label}
              </Toggle>
            ))}
          </div>
        </div>
      </BasePicker>
      <div style={rowsStyle(isMobile)}>
        {HARMONIES.map(([label, kind]) => {
          const colors =
            space === "ryb"
              ? harmonyRyb(base, kind, cube)
              : harmony(base, kind, style);
          return (
            <SwatchRow
              key={kind}
              ink={ink}
              isMobile={isMobile}
              colors={colors}
              swatchHeight={isMobile ? 76 : 56}
              onUse={() => onApply(colors)}
            >
              <div
                style={{
                  fontFamily: POSTER.display,
                  fontSize: 16,
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </div>
            </SwatchRow>
          );
        })}
      </div>
    </div>
  );
};

const TonesBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [base, setBase] = useState(palette[0]?.hex ?? "#ff3d00");
  return (
    <div style={sectionStyle(ink, isMobile, false)}>
      <div style={subHeaderStyle(ink)}>TONES</div>
      <BasePicker
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        label="SEED COLOR"
        value={base}
        onChange={setBase}
      />
      <div style={rowsStyle(isMobile)}>
        {TONE_METHODS.map((m) => {
          const scale = tones(base, m.id);
          return (
            <SwatchRow
              key={m.id}
              ink={ink}
              isMobile={isMobile}
              colors={scale}
              swatchHeight={isMobile ? 64 : 48}
              onUse={() => onApply(scale)}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: POSTER.display,
                    fontSize: 16,
                    letterSpacing: "0.02em",
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontFamily: POSTER.body,
                    fontSize: 10,
                    letterSpacing: "0.04em",
                    opacity: 0.6,
                    marginTop: 2,
                  }}
                >
                  {m.caption}
                </div>
              </div>
            </SwatchRow>
          );
        })}
      </div>
    </div>
  );
};

interface BasePickerProps {
  ink: string;
  isMobile: boolean;
  palette: Palette;
  label: string;
  value: string;
  onChange: (hex: string) => void;
  children?: ReactNode;
}

const BasePicker = ({
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

const SwatchRow = ({
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
  divide?: boolean;
  onClick: () => void;
  children: ReactNode;
}

const Toggle = ({
  ink,
  active,
  tall,
  divide,
  onClick,
  children,
}: ToggleProps) => {
  const invert = ink === POSTER.ink ? POSTER.bg : POSTER.ink;
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: tall ? "12px 14px" : "8px 12px",
        minHeight: tall ? 44 : undefined,
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        border: "none",
        borderRight: divide ? `2px solid ${ink}` : "none",
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
