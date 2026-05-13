import { ReactNode } from "react";
import { Backdrop, SmallBtn } from "./Backdrop";
import { useExitAnimation } from "../../hooks/use_exit_animation";
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

// The preferences drawer. On desktop it docks in PosterSkin's content-row
// side-panel slot (a bare flex column — the slot supplies the borderLeft +
// the slide-in, like the other side panels); on mobile it's a Backdrop-backed
// bottom sheet. PR-3 holds Appearance (LIGHT|DARK), Display (ticker on/off)
// and a link to the saved-palettes panel; PR-4 fills in palette name + save,
// the saved list inline, the SYSTEM theme option, the colour-format picker,
// the randomise-strategy picker and the naming gallery.
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
}: Props) => {
  const { closing, requestClose, onAnimationEnd } = useExitAnimation(onClose);
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
  );

  return isMobile ? (
    <Backdrop onClose={requestClose} align="bottom">
      {body}
    </Backdrop>
  ) : (
    body
  );
};

interface SectionProps {
  ink: string;
  title: string;
  children: ReactNode;
}

const Section = ({ ink, title, children }: SectionProps) => (
  <div
    style={{
      borderBottom: `1px solid ${ink}`,
      padding: "16px 24px",
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
