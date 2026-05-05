import {
  CSSProperties,
  DragEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
} from "react";
import { ColorCardProps } from "../../types/ColorCardProps";
import { hexToHsl } from "../../functions/color_converters";
import { fontColorFor } from "../../functions/contrast";
import { TerminalEditTray } from "./TerminalEditTray";
import { TERMINAL } from "./tokens";

interface Props {
  color: ColorCardProps;
  name: string;
  index: number;
  editing: boolean;
  nameFontSize: number;
  ink: string;
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

export const TerminalTile = ({
  color,
  name,
  index,
  editing,
  nameFontSize,
  ink,
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
  const fontColor = fontColorFor(color.hex);
  const hsl = hexToHsl(color.hex);
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
      onClick={() => {
        if (!editing) onEdit();
      }}
      style={{
        aspectRatio: "1 / 1",
        background: color.hex,
        color: fontColor,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        cursor: editing ? "default" : "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        touchAction: "manipulation",
        padding: "10px 12px 14px",
        overflow: "hidden",
        borderRight: `${TERMINAL.borderW}px solid ${ink}`,
        borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
        fontFamily: TERMINAL.mono,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          letterSpacing: "0.14em",
          fontWeight: 700,
          opacity: 0.85,
          marginRight: 48,
          flexShrink: 0,
        }}
      >
        <span>[{num}]</span>
        <span>{color.locked ? "[LOCK]" : `[${hsl.l.toFixed(0)}L]`}</span>
      </div>

      <TileChip
        style={{ top: 0, right: 0 }}
        fontColor={fontColor}
        active={color.locked}
        ariaLabel={color.locked ? "unlock" : "lock"}
        onClick={(e) => {
          e.stopPropagation();
          onLock();
        }}
      >
        {color.locked ? "[L]" : "[ ]"}
      </TileChip>

      <TileChip
        style={{ bottom: 0, right: 0 }}
        fontColor={fontColor}
        ariaLabel="delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        [X]
      </TileChip>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.04em",
          marginRight: 24,
        }}
      >
        {color.hex.toUpperCase()}
      </div>

      <div
        style={{
          fontSize: nameFontSize,
          fontWeight: 700,
          textTransform: "uppercase",
          lineHeight: 1.05,
          textAlign: "center",
          marginRight: 48,
          maxHeight: Math.max(nameFontSize * 2.2, 28),
          overflow: "hidden",
        }}
      >
        {name}
      </div>

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

interface ChipProps {
  children: ReactNode;
  fontColor: string;
  active?: boolean;
  ariaLabel: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
}

const TileChip = ({
  children,
  fontColor,
  active,
  ariaLabel,
  onClick,
  style,
}: ChipProps) => (
  <button
    aria-label={ariaLabel}
    onClick={onClick}
    style={{
      position: "absolute",
      width: 44,
      height: 44,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: active ? fontColor : "transparent",
      color: active ? (fontColor === "#000000" ? "#fff" : "#000") : fontColor,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      lineHeight: 1,
      fontWeight: 700,
      fontFamily: TERMINAL.mono,
      letterSpacing: "0.04em",
      touchAction: "manipulation",
      ...style,
    }}
  >
    {children}
  </button>
);
