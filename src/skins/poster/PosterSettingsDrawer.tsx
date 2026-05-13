import { ReactNode, useState } from "react";
import { Backdrop, SmallBtn } from "./Backdrop";
import { useExitAnimation } from "../../hooks/use_exit_animation";
import { usePalette } from "../../context/PaletteContext";
import { DisplayMode } from "../../types/Colors";
import {
  SavedPalette,
  defaultPaletteName,
} from "../../functions/saved_palettes";
import { POSTER } from "./tokens";
import { RandomiseSection } from "./settings/RandomiseSection";
import { NamingSection } from "./settings/NamingSection";

export type ThemeChoice = "system" | "light" | "dark";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
  theme: ThemeChoice;
  onSetTheme: (t: ThemeChoice) => void;
  tickerVisible: boolean;
  onToggleTicker: () => void;
  savedList: SavedPalette[];
  onSavePalette: (name: string) => void;
  onLoadPalette: (hexes: string[]) => void;
  onDeletePalette: (id: string) => void;
  onClose: () => void;
}

const FORMAT_OPTIONS: { value: DisplayMode; label: string }[] = [
  { value: "hex", label: "HEX" },
  { value: "rgb", label: "RGB" },
  { value: "hsl", label: "HSL" },
  { value: "hsv", label: "HSV" },
  { value: "oklch", label: "OKLCH" },
  { value: "all", label: "ALL" },
];

// The preferences drawer. On desktop it docks in PosterSkin's content-row
// side-panel slot (a bare flex column — the slot supplies the borderLeft + the
// slide-in, like the other side panels); on mobile it's a Backdrop-backed
// bottom sheet. Sections: palette name + SAVE · saved palettes (load/del) ·
// appearance (SYSTEM|LIGHT|DARK) · colour format · randomise strategy · naming ·
// display (ticker).
export const PosterSettingsDrawer = ({
  ink,
  bg,
  isMobile,
  theme,
  onSetTheme,
  tickerVisible,
  onToggleTicker,
  savedList,
  onSavePalette,
  onLoadPalette,
  onDeletePalette,
  onClose,
}: Props) => {
  const { closing, requestClose, onAnimationEnd } = useExitAnimation(onClose);
  const [name, setName] = useState("");
  const save = () => {
    onSavePalette(name.trim() || defaultPaletteName(Date.now()));
    setName("");
  };
  const body = (
    <div
      onClick={(e) => e.stopPropagation()}
      onAnimationEnd={isMobile ? onAnimationEnd : undefined}
      style={
        isMobile
          ? {
              background: bg,
              color: ink,
              borderTop: `${POSTER.borderW}px solid ${ink}`,
              width: "100%",
              maxWidth: "100vw",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              animation: closing
                ? "settingsSheetDown .2s cubic-bezier(.4,0,.6,1) forwards"
                : "settingsSheetUp .26s cubic-bezier(.2,.7,.3,1)",
            }
          : {
              background: bg,
              color: ink,
              width: "100%",
              height: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }
      }
    >
      <style>{`@keyframes settingsSheetUp { from { transform: translateY(100%); } } @keyframes settingsSheetDown { to { transform: translateY(100%); } }`}</style>
      <div
        style={{
          borderBottom: `${POSTER.borderW}px solid ${ink}`,
          padding: isMobile ? "16px 22px" : "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: POSTER.display,
            fontSize: isMobile ? 28 : 34,
            letterSpacing: "-0.02em",
          }}
        >
          SETTINGS
        </div>
        <button
          onClick={isMobile ? requestClose : onClose}
          aria-label="close settings"
          style={{
            background: "none",
            border: `2px solid ${ink}`,
            color: ink,
            width: isMobile ? 44 : 34,
            height: isMobile ? 44 : 34,
            fontSize: isMobile ? 22 : 18,
            fontWeight: 700,
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          ×
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <Section ink={ink} title="PALETTE NAME">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
              }}
              placeholder="name this palette…"
              aria-label="palette name"
              style={{
                fontFamily: POSTER.mono,
                fontSize: 13,
                padding: isMobile ? "10px 12px" : "7px 10px",
                border: `2px solid ${ink}`,
                background: "transparent",
                color: ink,
                flex: 1,
                minWidth: 0,
                outline: "none",
                minHeight: isMobile ? 44 : undefined,
              }}
            />
            <SmallBtn ink={ink} onClick={save} tall>
              ♥ SAVE
            </SmallBtn>
          </div>
        </Section>

        <Section ink={ink} title={`SAVED PALETTES (${savedList.length})`}>
          {savedList.length === 0 ? (
            <div
              style={{
                fontFamily: POSTER.body,
                fontSize: 12,
                opacity: 0.55,
              }}
            >
              Nothing saved yet — name a palette above and hit SAVE.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {savedList.map((s) => (
                <div key={s.id} style={{ border: `2px solid ${ink}` }}>
                  <div style={{ display: "flex", height: isMobile ? 40 : 28 }}>
                    {s.hexes.map((h, i) => (
                      <div key={i} style={{ flex: 1, background: h }} />
                    ))}
                  </div>
                  <div
                    style={{
                      padding: "8px 10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      borderTop: `2px solid ${ink}`,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontFamily: POSTER.display,
                          fontSize: 15,
                          letterSpacing: "0.02em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {s.name}
                      </div>
                      <div
                        style={{
                          fontFamily: POSTER.mono,
                          fontSize: 10,
                          opacity: 0.6,
                        }}
                      >
                        {new Date(s.createdAt).toLocaleDateString()} ·{" "}
                        {s.hexes.length} colors
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <SmallBtn
                        ink={ink}
                        tall={isMobile}
                        onClick={() => onLoadPalette(s.hexes)}
                      >
                        LOAD
                      </SmallBtn>
                      <SmallBtn
                        ink={ink}
                        tall={isMobile}
                        onClick={() => onDeletePalette(s.id)}
                      >
                        DEL
                      </SmallBtn>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section ink={ink} title="APPEARANCE">
          <Segmented
            ink={ink}
            bg={bg}
            value={theme}
            options={[
              { value: "system", label: "SYSTEM" },
              { value: "light", label: "LIGHT" },
              { value: "dark", label: "DARK" },
            ]}
            onChange={onSetTheme}
          />
          <div
            style={{
              fontFamily: POSTER.body,
              fontSize: 11,
              opacity: 0.55,
              marginTop: 6,
            }}
          >
            SYSTEM follows your browser preference.
          </div>
        </Section>

        <Section ink={ink} title="COLOUR FORMAT">
          <FormatSection ink={ink} bg={bg} />
        </Section>

        <Section ink={ink} title="RANDOMISE">
          <RandomiseSection ink={ink} isMobile={isMobile} />
        </Section>

        <Section ink={ink} title="NAMING">
          <NamingSection ink={ink} bg={bg} isMobile={isMobile} />
        </Section>

        <Section ink={ink} title="DISPLAY">
          <Segmented
            ink={ink}
            bg={bg}
            value={tickerVisible ? "on" : "off"}
            options={[
              { value: "off", label: "TICKER OFF" },
              { value: "on", label: "TICKER ON" },
            ]}
            onChange={(v) => {
              if ((v === "on") !== tickerVisible) onToggleTicker();
            }}
          />
        </Section>
      </div>
    </div>
  );

  return isMobile ? (
    <Backdrop onClose={requestClose} align="bottom">
      {body}
    </Backdrop>
  ) : (
    body
  );
};

const FormatSection = ({ ink, bg }: { ink: string; bg: string }) => {
  const { colorMode, setColorMode } = usePalette();
  return (
    <Segmented
      ink={ink}
      bg={bg}
      value={colorMode}
      options={FORMAT_OPTIONS}
      onChange={setColorMode}
    />
  );
};

interface SectionProps {
  ink: string;
  title: string;
  children: ReactNode;
}

const Section = ({ ink, title, children }: SectionProps) => (
  <div style={{ borderBottom: `1px solid ${ink}`, padding: "16px 24px" }}>
    <div
      style={{
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        opacity: 0.6,
        marginBottom: 10,
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

interface SegmentedProps<T extends string> {
  ink: string;
  bg: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

const Segmented = <T extends string>({
  ink,
  bg,
  value,
  options,
  onChange,
}: SegmentedProps<T>) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      border: `2px solid ${ink}`,
      width: "fit-content",
      maxWidth: "100%",
    }}
  >
    {options.map((o, i) => {
      const active = o.value === value;
      return (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={active}
          style={{
            fontFamily: POSTER.body,
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "8px 14px",
            border: "none",
            borderLeft: i === 0 ? "none" : `2px solid ${ink}`,
            background: active ? ink : "transparent",
            color: active ? bg : ink,
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);
