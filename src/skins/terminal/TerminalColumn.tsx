import {
  DragEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  useMemo,
  useState,
} from "react";
import { ColorCardProps } from "../../types/ColorCardProps";
import { hexToHsl, hexToRgb } from "../../functions/color_converters";
import { fontColorFor } from "../../functions/contrast";
import { TerminalEditTray } from "./TerminalEditTray";
import { TERMINAL } from "./tokens";

interface Props {
  color: ColorCardProps;
  name: string;
  index: number;
  editing: boolean;
  nameFontSize: number;
  onEdit: () => void;
  onCloseEdit: () => void;
  onUpdate: (hex: string) => void;
  onDelete: () => void;
  onLock: () => void;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
  ink: string;
}

const ASCII_GLYPHS = ["·", "·", "·", "+", "+", "*", "◼"];

export const TerminalColumn = ({
  color,
  name,
  index,
  editing,
  nameFontSize,
  onEdit,
  onCloseEdit,
  onUpdate,
  onDelete,
  onLock,
  onDragStart,
  onDragOver,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ink,
}: Props) => {
  const [hov, setHov] = useState(false);
  const fontColor = fontColorFor(color.hex);
  const rgb = hexToRgb(color.hex);
  const hsl = hexToHsl(color.hex);

  const ascii = useMemo(
    () =>
      Array.from({ length: 28 }, (_, r) =>
        Array.from({ length: 26 }, (_, c) => {
          const v = (r * 31 + c * 17 + index * 13) % 7;
          return ASCII_GLYPHS[v];
        }).join(" "),
      ).join("\n"),
    [index],
  );

  return (
    <div
      data-column-index={index}
      draggable={!editing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
        background: color.hex,
        color: fontColor,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        cursor: editing ? "default" : "grab",
        userSelect: "none",
        touchAction: "pan-y",
        borderRight: `${TERMINAL.borderW}px solid ${ink}`,
      }}
    >
      <div
        style={{
          padding: "0 12px",
          height: 28,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
          opacity: 0.85,
          fontSize: 10,
          letterSpacing: "0.12em",
          fontWeight: 600,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {color.locked && <span style={{ flexShrink: 0 }}>◼</span>}
        <span style={{ overflow: "hidden", minWidth: 0 }}>
          {String(index + 1).padStart(3, "0")}/{color.hex.toUpperCase()}
        </span>
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 28,
          left: 0,
          right: 0,
          height: 0,
          borderTop: `1px dashed ${fontColor}`,
          opacity: 0.85,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          flex: 1,
          padding: "14px 12px",
          overflow: "hidden",
          fontFamily: TERMINAL.mono,
          fontSize: 9,
          lineHeight: 1.05,
          whiteSpace: "pre",
          opacity: 0.18,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {ascii}
      </div>

      <div
        style={{
          padding: "12px 12px 14px",
          borderTop: `1px solid ${fontColor}`,
          background: color.hex,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          height: 160,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            fontWeight: 600,
            opacity: 0.65,
            textTransform: "uppercase",
          }}
        >
          NAME
        </div>
        <div
          style={{
            fontSize: nameFontSize,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          {name}
        </div>

        <div
          style={{
            marginTop: "auto",
            fontSize: 11,
            lineHeight: 1.6,
            opacity: 0.85,
          }}
        >
          <div>HEX: {color.hex.toUpperCase()}</div>
          <div>
            RGB: {Math.round(rgb.r)}.{Math.round(rgb.g)}.{Math.round(rgb.b)}
          </div>
          <div>
            HSL: {Math.round(hsl.h)}°.{Math.round(hsl.s)}.{Math.round(hsl.l)}
          </div>
        </div>
      </div>

      {hov && !editing && (
        <div
          style={{
            position: "absolute",
            top: 38,
            left: 12,
            right: 12,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <BrutColBtn
            fontColor={fontColor}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            &gt; EDIT_
          </BrutColBtn>
          <BrutColBtn
            fontColor={fontColor}
            onClick={(e) => {
              e.stopPropagation();
              onLock();
            }}
          >
            &gt; {color.locked ? "UNLOCK" : "LOCK"}_
          </BrutColBtn>
          <BrutColBtn
            fontColor={fontColor}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            &gt; DELETE_
          </BrutColBtn>
        </div>
      )}

      {editing && (
        <TerminalEditTray
          color={color}
          fontColor={fontColor}
          onUpdate={onUpdate}
          onClose={onCloseEdit}
        />
      )}
    </div>
  );
};

interface ColBtnProps {
  children: ReactNode;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  fontColor: string;
}

const BrutColBtn = ({ children, onClick, fontColor }: ColBtnProps) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: TERMINAL.mono,
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: "0.06em",
        padding: "6px 10px",
        textAlign: "left",
        background: hov ? fontColor : "transparent",
        color: hov ? (fontColor === "#000000" ? "#fff" : "#000") : fontColor,
        border: `1px solid ${fontColor}`,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
};
