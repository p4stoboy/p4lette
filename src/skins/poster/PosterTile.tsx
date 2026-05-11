import {
  CSSProperties,
  DragEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
} from "react";
import { usePalette } from "../../context/PaletteContext";
import { ColorCardProps } from "../../types/ColorCardProps";
import { fontColorFor } from "../../functions/contrast";
import { formatColor } from "../../functions/color_converters";
import { PosterEditTray } from "./PosterEditTray";
import { POSTER } from "./tokens";

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

export const PosterTile = ({
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
  const { colorMode } = usePalette();
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
      onClick={() => {
        if (!editing) onEdit();
      }}
      style={{
        aspectRatio: editing ? "auto" : "1 / 1",
        gridColumn: editing ? "1 / -1" : "auto",
        minHeight: editing ? 540 : undefined,
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
        padding: 14,
        overflow: "hidden",
        borderRight: `1px solid ${ink}`,
        borderBottom: `1px solid ${ink}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 14,
          fontFamily: POSTER.body,
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: "0.12em",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      >
        {num}
      </div>

      <TileChip
        style={{ top: 4, right: 4 }}
        fontColor={fontColor}
        active={color.locked}
        ariaLabel={color.locked ? "unlock" : "lock"}
        onClick={(e) => {
          e.stopPropagation();
          onLock();
        }}
      >
        {color.locked ? "◼" : "◻"}
      </TileChip>

      <TileChip
        style={{ bottom: 4, right: 4 }}
        fontColor={fontColor}
        ariaLabel="delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        ×
      </TileChip>

      <div
        style={{
          marginTop: "auto",
          marginRight: 48,
          display: "flex",
          flexDirection: "column",
          gap: 4,
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
        <div
          style={{
            fontFamily: POSTER.mono,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.04em",
            opacity: 0.85,
          }}
        >
          {formatColor(color.hex, colorMode)}
        </div>
      </div>

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
      fontSize: 20,
      lineHeight: 1,
      fontWeight: 700,
      fontFamily: POSTER.body,
      touchAction: "manipulation",
      ...style,
    }}
  >
    {children}
  </button>
);
