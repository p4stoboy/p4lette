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
import { extrapolateHex, mixHex } from "../../functions/color_mix";
import { formatAll, formatColor } from "../../functions/color_converters";
import { PosterEditTray } from "./PosterEditTray";
import { POSTER } from "./tokens";

interface Props {
  color: ColorCardProps;
  name: string;
  index: number;
  editing: boolean;
  nameFontSize: number;
  // The flex shorthand the parent computes for this column: a wide basis while
  // editing; `0 0 <EXPAND_TARGET>px` while hover-expanded; `0 0 <snapshot>px` while
  // pinned (a sibling was just inserted); else `1 1 0`. The strip snaps — no tween.
  flexDecl: string;
  // Neighbour hexes, for the "+" insert previews. `undefined` at the strip's ends.
  leftHex: string | undefined;
  rightHex: string | undefined;
  onEdit: () => void;
  onCloseEdit: () => void;
  onUpdate: (hex: string) => void;
  onDelete: () => void;
  onLock: () => void;
  // Insert a colour just left / right of this column; the argument is this column's
  // own computed preview hex for that side (so the parent doesn't recompute it).
  onInsertLeft: (hex: string) => void;
  onInsertRight: (hex: string) => void;
  // Mouse entered / left this column — drives the parent's hover-expand and the
  // post-insert width freeze.
  onHoverChange: (hovered: boolean) => void;
  // Callback ref to the root node; the parent snapshots column widths on insert.
  columnRef: (el: HTMLDivElement | null) => void;
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
  flexDecl,
  leftHex,
  rightHex,
  onEdit,
  onCloseEdit,
  onUpdate,
  onDelete,
  onLock,
  onInsertLeft,
  onInsertRight,
  onHoverChange,
  columnRef,
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

  // What each "+" would insert: the OKLab midpoint with that neighbour, or — at an
  // end — a step past this colour away from the other neighbour (lightening toward
  // white / darkening toward black when this is the only column left).
  const leftPreview = leftHex
    ? mixHex(leftHex, color.hex)
    : rightHex
      ? extrapolateHex(color.hex, rightHex, 0.6)
      : mixHex(color.hex, "#ffffff", 0.5);
  const rightPreview = rightHex
    ? mixHex(color.hex, rightHex)
    : leftHex
      ? extrapolateHex(color.hex, leftHex, 0.6)
      : mixHex(color.hex, "#000000", 0.5);

  return (
    <div
      ref={columnRef}
      data-column-index={index}
      draggable={!editing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onMouseEnter={() => {
        setHov(true);
        onHoverChange(true);
      }}
      onMouseLeave={() => {
        setHov(false);
        onHoverChange(false);
      }}
      style={{
        flex: flexDecl,
        minWidth: 0,
        background: color.hex,
        color: fontColor,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        cursor: editing ? "default" : "grab",
        userSelect: "none",
        touchAction: "pan-y",
        transition: "none",
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
        <>
          <div
            style={{
              position: "absolute",
              top: 96,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
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

          <InsertEdge
            side="left"
            fontColor={fontColor}
            preview={leftPreview}
            onInsert={() => onInsertLeft(leftPreview)}
          />
          <InsertEdge
            side="right"
            fontColor={fontColor}
            preview={rightPreview}
            onInsert={() => onInsertRight(rightPreview)}
          />
        </>
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
        padding: "6px 0",
        width: 100,
        boxSizing: "border-box",
        textAlign: "center",
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

interface InsertEdgeProps {
  side: "left" | "right";
  fontColor: string;
  preview: string;
  onInsert: () => void;
}

// A half-tile over a hovered column's left or right edge. Idle (column hovered,
// edge not): a faint "+" in the column's font colour. Edge hovered: fills with the
// colour a click would insert — the OKLab midpoint with the neighbour, or an end
// extrapolation — with the "+" in that colour's own readable ink. Click → insert.
const InsertEdge = ({
  side,
  fontColor,
  preview,
  onInsert,
}: InsertEdgeProps) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      aria-label={`insert colour to the ${side}`}
      draggable={false}
      onClick={(e) => {
        e.stopPropagation();
        onInsert();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "absolute",
        top: "50%",
        ...(side === "left" ? { left: 0 } : { right: 0 }),
        transform: "translateY(-50%)",
        width: "calc(50% - 8px)",
        maxWidth: 120,
        height: "40%",
        minHeight: 80,
        maxHeight: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        background: hov ? preview : "transparent",
        color: hov ? fontColorFor(preview) : fontColor,
        opacity: hov ? 1 : 0.4,
        fontFamily: POSTER.display,
        fontSize: 56,
        lineHeight: 1,
        cursor: "pointer",
        transition: "background .15s ease, opacity .15s ease",
        zIndex: 2,
      }}
    >
      ＋
    </button>
  );
};
