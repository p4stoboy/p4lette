import { ReactNode } from "react";
import { Backdrop, SmallBtn } from "./Backdrop";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
  theme: "light" | "dark";
  onSetTheme: (t: "light" | "dark") => void;
  tickerVisible: boolean;
  onToggleTicker: () => void;
  savedCount: number;
  onManageSaved: () => void;
  onClose: () => void;
}

// The preferences drawer. PR-3 ships the shell plus the bits that used to live
// in the nav: Appearance (LIGHT|DARK), Display (ticker on/off) and a link to
// the saved-palettes panel. PR-4 fills in palette name + save, the saved list
// inline, the SYSTEM theme option, the colour-format picker, the randomise-
// strategy picker and the naming gallery. Desktop: a ~380px right-docked
// panel; mobile: a bottom sheet.
export const PosterSettingsDrawer = ({
  ink,
  bg,
  isMobile,
  theme,
  onSetTheme,
  tickerVisible,
  onToggleTicker,
  savedCount,
  onManageSaved,
  onClose,
}: Props) => (
  <Backdrop onClose={onClose} align={isMobile ? "bottom" : "right"}>
    <style>{`@keyframes settingsInRight { from { transform: translateX(100%); } to { transform: translateX(0); } } @keyframes settingsInUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: bg,
        color: ink,
        borderLeft: isMobile ? "none" : `${POSTER.borderW}px solid ${ink}`,
        borderTop: isMobile ? `${POSTER.borderW}px solid ${ink}` : "none",
        width: isMobile ? "100%" : 380,
        maxWidth: "100%",
        height: isMobile ? "78%" : "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: isMobile
          ? `0 -10px 0 ${POSTER.accent}`
          : `-12px 0 0 ${POSTER.accent}`,
        animation: isMobile
          ? "settingsInUp .22s cubic-bezier(.2,.7,.3,1)"
          : "settingsInRight .24s cubic-bezier(.2,.7,.3,1)",
      }}
    >
      <div
        style={{
          borderBottom: `${POSTER.borderW}px solid ${ink}`,
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: POSTER.display,
            fontSize: 22,
            letterSpacing: "-0.01em",
          }}
        >
          SETTINGS
        </div>
        <button
          onClick={onClose}
          aria-label="close settings"
          style={{
            background: "none",
            border: isMobile ? `2px solid ${ink}` : "none",
            fontSize: 22,
            cursor: "pointer",
            color: ink,
            width: isMobile ? 44 : undefined,
            height: isMobile ? 44 : undefined,
            touchAction: "manipulation",
          }}
        >
          ×
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <Section ink={ink} title="APPEARANCE">
          <Segmented
            ink={ink}
            bg={bg}
            value={theme}
            options={[
              { value: "light", label: "LIGHT" },
              { value: "dark", label: "DARK" },
            ]}
            onChange={onSetTheme}
          />
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

        <Section ink={ink} title="SAVED PALETTES">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: POSTER.body,
                fontSize: 13,
                opacity: 0.8,
              }}
            >
              {savedCount} saved
            </span>
            <SmallBtn ink={ink} onClick={() => onManageSaved()} tall>
              MANAGE →
            </SmallBtn>
          </div>
        </Section>

        <Section ink={ink} title="MORE">
          <p
            style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.5,
              opacity: 0.65,
              fontFamily: POSTER.body,
            }}
          >
            Palette name &amp; save, the saved list inline, the SYSTEM theme
            option, colour format and naming move here next.
          </p>
        </Section>
      </div>
    </div>
  </Backdrop>
);

interface SectionProps {
  ink: string;
  title: string;
  children: ReactNode;
}

const Section = ({ ink, title, children }: SectionProps) => (
  <div
    style={{
      borderBottom: `1px solid ${ink}`,
      padding: "16px 18px",
    }}
  >
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
