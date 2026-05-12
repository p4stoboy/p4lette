import {
  DragEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  useState,
} from "react";
import { usePalette } from "../../context/PaletteContext";
import { ColorCardProps } from "../../types/ColorCardProps";
import { fontColorFor } from "../../functions/contrast";
import { formatAll, formatColor } from "../../functions/color_converters";
import { PosterEditTray } from "./PosterEditTray";
import { POSTER } from "./tokens";

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
}

export const PosterColumn = ({
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
}: Props) => {
  const { colorMode } = usePalette();
  const [hov, setHov] = useState(false);
  const fontColor = fontColorFor(color.hex);
  const num = String(index + 1).padStart(2, "0");

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
        background: color.hex,
        color: fontColor,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        cursor: editing ? "default" : "grab",
        userSelect: "none",
        touchAction: "pan-y",
        transition: "flex .25s ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          fontFamily: POSTER.display,
          fontSize: 80,
          lineHeight: 0.85,
          letterSpacing: "-0.04em",
          opacity: 0.18,
          pointerEvents: "none",
        }}
      >
        {num}
      </div>

      {color.locked && (
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            fontFamily: POSTER.body,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.1em",
            padding: "4px 8px",
            border: `2px solid ${fontColor}`,
          }}
        >
          LOCKED
        </div>
      )}

      <div
        style={{
          marginTop: "auto",
          padding: "24px 20px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            fontFamily: POSTER.display,
            fontSize: nameFontSize,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            textWrap: "balance",
          }}
        >
          {name}
        </div>
        {colorMode === "all" ? (
          <div
            style={{
              fontFamily: POSTER.mono,
              fontWeight: 500,
              letterSpacing: "0.04em",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {formatAll(color.hex).map(({ mode, value }, i) => (
              <div
                key={mode}
                style={{
                  fontSize: i === 0 ? 14 : 10,
                  opacity: i === 0 ? 0.85 : 0.55,
                }}
              >
                {value}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              fontFamily: POSTER.mono,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.04em",
              opacity: 0.85,
            }}
          >
            {formatColor(color.hex, colorMode)}
          </div>
        )}
      </div>

      {hov && !editing && (
        <div
          style={{
            position: "absolute",
            left: 18,
            top: "38%",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <ColAction
            fontColor={fontColor}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            EDIT
          </ColAction>
          <ColAction
            fontColor={fontColor}
            onClick={(e) => {
              e.stopPropagation();
              onLock();
            }}
          >
            {color.locked ? "UNLOCK" : "LOCK"}
          </ColAction>
          <ColAction
            fontColor={fontColor}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            REMOVE
          </ColAction>
        </div>
      )}

      {editing && (
        <PosterEditTray
          color={color}
          fontColor={fontColor}
          onUpdate={onUpdate}
          onClose={onCloseEdit}
        />
      )}
    </div>
  );
};

interface ColActionProps {
  children: ReactNode;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  fontColor: string;
}

const ColAction = ({ children, onClick, fontColor }: ColActionProps) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.1em",
        padding: "6px 12px",
        textAlign: "left",
        background: hov ? fontColor : "transparent",
        color: hov ? (fontColor === "#000000" ? "#fff" : "#000") : fontColor,
        border: `2px solid ${fontColor}`,
        cursor: "pointer",
        transition: "all .12s",
        textTransform: "uppercase",
      }}
    >
      {children}
    </button>
  );
};
