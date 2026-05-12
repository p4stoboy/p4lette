import { ReactNode, useState } from "react";
import { SmallBtn } from "./Backdrop";
import { Palette } from "../../types/Palette";
import { usePalette } from "../../context/PaletteContext";
import {
  HARMONY_HSV_KINDS,
  HARMONY_STYLES,
  HarmonyKind,
  PaletteStyle,
  RYB_CUBES,
  harmony,
  harmonyHsv,
  harmonyRyb,
} from "../../functions/harmony";
import { TONE_METHODS, dittoMatch, tones } from "../../functions/tones";
import {
  BLEND_MODES,
  BlendMode,
  CvdType,
  EFFECTS,
  applyEffect,
  blendWith,
  simulateCvd,
  snapToGamut,
} from "../../functions/color_filters";
import {
  PIGMENT_CUBES,
  cubeCorners,
  pigmentFilter,
  pigmentWheel,
} from "../../functions/pigment";
import {
  MIX_CURVES,
  MIX_SPACES,
  MIX_STEPS,
  MixCurve,
  MixSpace,
  mixSteps,
} from "../../functions/color_mix";
import {
  GEN_STRATEGIES,
  GenStrategy,
  RAMP_PARAM_META,
  RampParams,
  defaultRampParams,
  generatePalette,
} from "../../functions/generate_palette";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
  palette: Palette;
  onClose: () => void;
  onApply: (hexes: string[]) => void;
}

type HarmonySpace = "oklch" | "ryb" | "hsv";

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
            HARMONY · TONES · FIXERS · PIGMENT · MIX · EFFECTS · GENERATE — hit
            USE to apply a result
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
      style={
        isMobile
          ? {
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }
          : {
              flex: 1,
              minHeight: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              alignContent: "start",
              overflowY: "auto",
            }
      }
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
      <FixersBody
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        onApply={onApply}
      />
      <PigmentBody
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        onApply={onApply}
      />
      <MixBody
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        onApply={onApply}
      />
      <EffectsBody
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        onApply={onApply}
      />
      <GenerateBody
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

// On desktop the body is a responsive grid (sections wrap when narrow); on
// mobile a stacked scrolling column. `isFirst` only matters for the mobile
// stack (the top section needs no divider above it).
const sectionStyle = (ink: string, isMobile: boolean, isFirst: boolean) => ({
  flex: isMobile ? ("0 0 auto" as const) : undefined,
  display: "flex" as const,
  flexDirection: "column" as const,
  minWidth: 0,
  minHeight: 0,
  borderRight: isMobile ? "none" : `${POSTER.borderW}px solid ${ink}`,
  borderTop: isMobile && !isFirst ? `${POSTER.borderW}px solid ${ink}` : "none",
});

const subHeaderStyle = (ink: string) => ({
  borderBottom: `2px solid ${ink}`,
  padding: "10px 16px",
  fontFamily: POSTER.display,
  fontSize: 20,
  letterSpacing: "-0.01em",
  flexShrink: 0,
});

// The body scrolls as a whole (grid on desktop, column on mobile), so a section's
// rows just flow — no nested scroll area.
const rowsStyle = () => ({
  flex: 1,
  overflowY: "visible" as const,
  padding: 16,
});

const SPACES: ReadonlyArray<readonly [HarmonySpace, string]> = [
  ["oklch", "OKLCH"],
  ["ryb", "RYB"],
  ["hsv", "HSV"],
];

const HarmonyBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [base, setBase] = useState(palette[0]?.hex ?? "#ff3d00");
  const [space, setSpace] = useState<HarmonySpace>("oklch");
  const [style, setStyle] = useState<PaletteStyle>("default");
  const [cube, setCube] = useState("itten");
  // Variant picker: styles for OKLCH, pigment cubes for RYB, nothing for HSV.
  const variants =
    space === "oklch"
      ? HARMONY_STYLES.map((s) => ({
          key: s,
          label: s,
          active: style === s,
          pick: () => setStyle(s),
        }))
      : space === "ryb"
        ? RYB_CUBES.map((c) => ({
            key: c.key,
            label: c.label,
            active: cube === c.key,
            pick: () => setCube(c.key),
          }))
        : [];
  const rows =
    space === "hsv"
      ? HARMONY_HSV_KINDS.map((k) => ({
          key: k.key,
          label: k.label,
          colors: harmonyHsv(base, k.key),
        }))
      : HARMONIES.map(([label, kind]) => ({
          key: kind,
          label,
          colors:
            space === "ryb"
              ? harmonyRyb(base, kind, cube)
              : harmony(base, kind, style),
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
            {SPACES.map(([key, label], i) => (
              <Toggle
                key={key}
                ink={ink}
                active={space === key}
                tall={isMobile}
                divide={i < SPACES.length - 1}
                onClick={() => setSpace(key)}
              >
                {label}
              </Toggle>
            ))}
          </div>
          {variants.length > 0 && (
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
          )}
        </div>
      </BasePicker>
      <div style={rowsStyle()}>
        {rows.map((r) => (
          <SwatchRow
            key={r.key}
            ink={ink}
            isMobile={isMobile}
            colors={r.colors}
            swatchHeight={isMobile ? 76 : 56}
            onUse={() => onApply(r.colors)}
          >
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              {r.label}
            </div>
          </SwatchRow>
        ))}
      </div>
    </div>
  );
};

const TonesBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [base, setBase] = useState(palette[0]?.hex ?? "#ff3d00");
  const match = dittoMatch(base);
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
      <div style={rowsStyle()}>
        {TONE_METHODS.map((m) => {
          const scale = tones(base, m.id);
          const caption =
            m.id === "ditto"
              ? `${m.caption} · matched ${match.shade} (${match.method})`
              : m.caption;
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
                  {caption}
                </div>
              </div>
            </SwatchRow>
          );
        })}
      </div>
    </div>
  );
};

const CVD_LABELS: Record<CvdType, string> = {
  prot: "PROTANOPIA",
  deuter: "DEUTERANOPIA",
  trit: "TRITANOPIA",
};
const CVD_TYPES: CvdType[] = ["prot", "deuter", "trit"];

// FIXERS — operates on the *live* palette (no seed). The CVD rows are a
// non-destructive preview; USE applies the transformed palette.
const FixersBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const hexes = palette.map((c) => c.hex);
  const snapped = snapToGamut(hexes);
  const alreadyOk = snapped.join() === hexes.join();
  const rowH = isMobile ? 76 : 56;
  const caption = (text: string) => (
    <div
      style={{
        fontFamily: POSTER.body,
        fontSize: 10,
        letterSpacing: "0.04em",
        opacity: 0.6,
        marginTop: 2,
      }}
    >
      {text}
    </div>
  );
  return (
    <div style={sectionStyle(ink, isMobile, false)}>
      <div style={subHeaderStyle(ink)}>FIXERS</div>
      <div style={rowsStyle()}>
        {CVD_TYPES.map((type) => {
          const sim = simulateCvd(hexes, type);
          return (
            <SwatchRow
              key={type}
              ink={ink}
              isMobile={isMobile}
              colors={sim}
              swatchHeight={rowH}
              onUse={() => onApply(sim)}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: POSTER.display,
                    fontSize: 16,
                    letterSpacing: "0.02em",
                  }}
                >
                  {CVD_LABELS[type]}
                </div>
                {caption(
                  `simulated — how this palette reads with ${CVD_LABELS[
                    type
                  ].toLowerCase()}`,
                )}
              </div>
            </SwatchRow>
          );
        })}
        <SwatchRow
          ink={ink}
          isMobile={isMobile}
          colors={snapped}
          swatchHeight={rowH}
          onUse={() => onApply(snapped)}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              IN-GAMUT sRGB
            </div>
            {caption(
              alreadyOk
                ? "every swatch is already displayable"
                : "every swatch snapped into displayable sRGB",
            )}
          </div>
        </SwatchRow>
      </div>
    </div>
  );
};

// PIGMENT — rybitten cube profiles as a print-like filter over the live palette.
// No seed colour; a profile picker drives all three rows.
const PigmentBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [cube, setCube] = useState(PIGMENT_CUBES[0]?.key ?? "itten");
  const active = PIGMENT_CUBES.find((c) => c.key === cube) ?? PIGMENT_CUBES[0];
  const hexes = palette.map((c) => c.hex);
  const filtered = pigmentFilter(hexes, cube);
  const wheel = pigmentWheel(cube, isMobile ? 7 : 11);
  const corners = cubeCorners(cube);
  const rowH = isMobile ? 76 : 56;
  const half = Math.ceil(PIGMENT_CUBES.length / 2);
  const cubeRows = [PIGMENT_CUBES.slice(0, half), PIGMENT_CUBES.slice(half)];
  const caption = (text: string) => (
    <div
      style={{
        fontFamily: POSTER.body,
        fontSize: 10,
        letterSpacing: "0.04em",
        opacity: 0.6,
        marginTop: 2,
      }}
    >
      {text}
    </div>
  );
  return (
    <div style={sectionStyle(ink, isMobile, false)}>
      <div style={subHeaderStyle(ink)}>PIGMENT</div>
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
          PROFILE
        </div>
        <div style={{ border: `2px solid ${ink}` }}>
          {cubeRows.map((row, ri) => (
            <div
              key={ri}
              style={{
                display: "flex",
                borderTop: ri > 0 ? `2px solid ${ink}` : undefined,
              }}
            >
              {row.map((c, i) => (
                <Toggle
                  key={c.key}
                  ink={ink}
                  active={c.key === cube}
                  tall={isMobile}
                  divide={i < row.length - 1}
                  onClick={() => setCube(c.key)}
                >
                  {c.label}
                </Toggle>
              ))}
            </div>
          ))}
        </div>
        {active && caption(active.meta)}
      </div>
      <div style={rowsStyle()}>
        <SwatchRow
          ink={ink}
          isMobile={isMobile}
          colors={filtered}
          swatchHeight={rowH}
          onUse={() => onApply(filtered)}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              FILTER
            </div>
            {caption(
              `your palette as ${active?.label ?? cube} would mix it — print-like`,
            )}
          </div>
        </SwatchRow>
        <SwatchRow
          ink={ink}
          isMobile={isMobile}
          colors={wheel}
          swatchHeight={rowH}
          onUse={() => onApply(wheel)}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              WHEEL
            </div>
            {caption("the cube's own colour wheel — pigment mixing, not light")}
          </div>
        </SwatchRow>
        <SwatchRow
          ink={ink}
          isMobile={isMobile}
          colors={corners}
          swatchHeight={rowH}
          onUse={() => onApply(corners)}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              THIS CUBE
            </div>
            {caption(
              "corners: white · red · yellow · orange · blue · violet · green · black",
            )}
          </div>
        </SwatchRow>
      </div>
    </div>
  );
};

// MIX — interpolate between two picked colours. Two stacked BasePickers
// (FROM / TO) over the live palette, then steps / space / curve toggles.
const MixBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [from, setFrom] = useState(palette[0]?.hex ?? "#ff3d00");
  const [to, setTo] = useState(palette[palette.length - 1]?.hex ?? "#00b4d8");
  const [n, setN] = useState(7);
  const [space, setSpace] = useState<MixSpace>("oklch");
  const [curve, setCurve] = useState<MixCurve>("even");
  const mixed = mixSteps(from, to, n, space, curve);
  return (
    <div style={sectionStyle(ink, isMobile, false)}>
      <div style={subHeaderStyle(ink)}>MIX</div>
      <BasePicker
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        label="FROM COLOR"
        value={from}
        onChange={setFrom}
      />
      <BasePicker
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        label="TO COLOR"
        value={to}
        onChange={setTo}
      >
        <div style={{ marginTop: 12, border: `2px solid ${ink}` }}>
          <div style={{ display: "flex" }}>
            {MIX_STEPS.map((s, i) => (
              <Toggle
                key={s}
                ink={ink}
                active={n === s}
                tall={isMobile}
                divide={i < MIX_STEPS.length - 1}
                onClick={() => setN(s)}
              >
                {String(s)}
              </Toggle>
            ))}
          </div>
          <div style={{ display: "flex", borderTop: `2px solid ${ink}` }}>
            {MIX_SPACES.map((s, i) => (
              <Toggle
                key={s.key}
                ink={ink}
                active={space === s.key}
                tall={isMobile}
                divide={i < MIX_SPACES.length - 1}
                onClick={() => setSpace(s.key)}
              >
                {s.label}
              </Toggle>
            ))}
          </div>
          <div style={{ display: "flex", borderTop: `2px solid ${ink}` }}>
            {MIX_CURVES.map((c, i) => (
              <Toggle
                key={c.key}
                ink={ink}
                active={curve === c.key}
                tall={isMobile}
                divide={i < MIX_CURVES.length - 1}
                onClick={() => setCurve(c.key)}
              >
                {c.label}
              </Toggle>
            ))}
          </div>
        </div>
      </BasePicker>
      <div style={rowsStyle()}>
        <SwatchRow
          ink={ink}
          isMobile={isMobile}
          colors={mixed}
          swatchHeight={isMobile ? 76 : 56}
          onUse={() => onApply(mixed)}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              {n} STEPS
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
              {from} → {to} in {space.toUpperCase()}
            </div>
          </div>
        </SwatchRow>
      </div>
    </div>
  );
};

// EFFECTS — one-shot culori filters over the live palette + a "blend the whole
// palette under a colour" control. No seed; reads the live palette.
const EffectsBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [over, setOver] = useState("#000000");
  const [mode, setMode] = useState<BlendMode>("multiply");
  const hexes = palette.map((c) => c.hex);
  const blended = blendWith(hexes, over, mode);
  const rowH = isMobile ? 76 : 56;
  const half = Math.ceil(BLEND_MODES.length / 2);
  const modeRows = [BLEND_MODES.slice(0, half), BLEND_MODES.slice(half)];
  return (
    <div style={sectionStyle(ink, isMobile, false)}>
      <div style={subHeaderStyle(ink)}>EFFECTS</div>
      <BasePicker
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        label="BLEND OVER"
        value={over}
        onChange={setOver}
      >
        <div style={{ marginTop: 12, border: `2px solid ${ink}` }}>
          {modeRows.map((row, ri) => (
            <div
              key={ri}
              style={{
                display: "flex",
                borderTop: ri > 0 ? `2px solid ${ink}` : undefined,
              }}
            >
              {row.map((m, i) => (
                <Toggle
                  key={m}
                  ink={ink}
                  active={m === mode}
                  tall={isMobile}
                  divide={i < row.length - 1}
                  onClick={() => setMode(m)}
                >
                  {m}
                </Toggle>
              ))}
            </div>
          ))}
        </div>
      </BasePicker>
      <div style={rowsStyle()}>
        {EFFECTS.map((e) => {
          const out = applyEffect(hexes, e.key);
          return (
            <SwatchRow
              key={e.key}
              ink={ink}
              isMobile={isMobile}
              colors={out}
              swatchHeight={rowH}
              onUse={() => onApply(out)}
            >
              <div
                style={{
                  fontFamily: POSTER.display,
                  fontSize: 16,
                  letterSpacing: "0.02em",
                }}
              >
                {e.label}
              </div>
            </SwatchRow>
          );
        })}
        <SwatchRow
          ink={ink}
          isMobile={isMobile}
          colors={blended}
          swatchHeight={rowH}
          onUse={() => onApply(blended)}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              BLEND · {mode.toUpperCase()}
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
              palette × {over}
            </div>
          </div>
        </SwatchRow>
      </div>
    </div>
  );
};

const RangeRow = ({
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

// GENERATE — pick a palette-generation strategy (and, for rampensau, tune its
// ramp), preview it, REGENERATE within the bounds, and USE — which both applies
// the preview *and* commits the strategy/params so the nav SHUFFLE button (and
// the `Space` shortcut) use them too.
const GenerateBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const { genStrategy, genParams, setGenConfig } = usePalette();
  const n = Math.max(palette.length, 1);
  const roll = (s: GenStrategy, p: RampParams): string[] =>
    generatePalette(n, s, Math.random, s === "rampensau" ? p : undefined);
  const [strategy, setStrategy] = useState<GenStrategy>(genStrategy);
  const [params, setParams] = useState<RampParams>(
    genParams ?? defaultRampParams(),
  );
  // The preview re-rolls on the events that should change it (strategy switch,
  // a slider move, REGEN) — never in an effect.
  const [preview, setPreview] = useState<string[]>(() =>
    roll(genStrategy, genParams ?? defaultRampParams()),
  );
  const pickStrategy = (s: GenStrategy) => {
    setStrategy(s);
    setPreview(roll(s, params));
  };
  const setParam = (k: keyof RampParams) => (v: number) => {
    const next = { ...params, [k]: v };
    setParams(next);
    if (strategy === "rampensau") setPreview(roll(strategy, next));
  };
  const commit = () => {
    onApply(preview);
    setGenConfig({
      strategy,
      params: strategy === "rampensau" ? params : null,
    });
  };
  return (
    <div style={sectionStyle(ink, isMobile, false)}>
      <div style={subHeaderStyle(ink)}>GENERATE</div>
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
          STRATEGY
        </div>
        <div style={{ display: "flex", border: `2px solid ${ink}` }}>
          {GEN_STRATEGIES.map((s, i) => (
            <Toggle
              key={s.key}
              ink={ink}
              active={strategy === s.key}
              tall={isMobile}
              divide={i < GEN_STRATEGIES.length - 1}
              onClick={() => pickStrategy(s.key)}
            >
              {s.label}
            </Toggle>
          ))}
        </div>
        {strategy === "rampensau" && (
          <div style={{ marginTop: 12 }}>
            <RangeRow
              ink={ink}
              label="SAT LO"
              meta={RAMP_PARAM_META.sLo}
              value={params.sLo}
              onChange={setParam("sLo")}
            />
            <RangeRow
              ink={ink}
              label="SAT HI"
              meta={RAMP_PARAM_META.sHi}
              value={params.sHi}
              onChange={setParam("sHi")}
            />
            <RangeRow
              ink={ink}
              label="LIGHT LO"
              meta={RAMP_PARAM_META.lLo}
              value={params.lLo}
              onChange={setParam("lLo")}
            />
            <RangeRow
              ink={ink}
              label="LIGHT HI"
              meta={RAMP_PARAM_META.lHi}
              value={params.lHi}
              onChange={setParam("lHi")}
            />
            <RangeRow
              ink={ink}
              label="HUE SPAN"
              meta={RAMP_PARAM_META.hueSpan}
              value={params.hueSpan}
              onChange={setParam("hueSpan")}
            />
            <RangeRow
              ink={ink}
              label="CURVE ACCENT"
              meta={RAMP_PARAM_META.curveAccent}
              value={params.curveAccent}
              onChange={setParam("curveAccent")}
            />
          </div>
        )}
      </div>
      <div style={rowsStyle()}>
        <SwatchRow
          ink={ink}
          isMobile={isMobile}
          colors={preview}
          swatchHeight={isMobile ? 76 : 56}
          onUse={commit}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              PREVIEW
            </div>
            <SmallBtn
              ink={ink}
              tall={isMobile}
              onClick={() => setPreview(roll(strategy, params))}
            >
              REGEN
            </SmallBtn>
          </div>
        </SwatchRow>
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
