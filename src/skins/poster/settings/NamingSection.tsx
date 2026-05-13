import { usePalette } from "../../../context/PaletteContext";
import { useColorLists } from "../../../hooks/use_color_lists";
import { fontColorFor } from "../../../functions/contrast";
import { POSTER } from "../tokens";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
}

// The color.pizza name-list picker, relocated from the old footer
// `PosterNamingPicker`: a `<select>` of the ~25 lists (`useColorLists`, fetched
// when the section mounts) bound to `nameList`/`setNameList`, plus a preview of
// the current palette with the names that list produces — `names` come straight
// from the context, which re-fetches them whenever `palette` or `nameList`
// changes, so the preview updates on its own.
export const NamingSection = ({ ink, bg, isMobile }: Props) => {
  const { palette, names, nameList, setNameList } = usePalette();
  const { lists, loading, error } = useColorLists(true);
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: POSTER.body,
          fontSize: 13,
          marginBottom: 12,
        }}
      >
        <span style={{ opacity: 0.7 }}>color.pizza/</span>
        <select
          value={nameList}
          onChange={(e) => setNameList(e.target.value)}
          aria-label="colour name list"
          style={{
            fontFamily: POSTER.mono,
            fontSize: 13,
            padding: isMobile ? "8px 10px" : "5px 8px",
            border: `2px solid ${ink}`,
            background: bg,
            color: ink,
            cursor: "pointer",
            minHeight: isMobile ? 40 : undefined,
            flex: 1,
            minWidth: 0,
          }}
        >
          {loading && <option>loading…</option>}
          {error && <option>load failed</option>}
          {!loading && !error && lists.length === 0 && (
            <option value={nameList}>{nameList}</option>
          )}
          {lists.map((l) => (
            <option
              key={l.key}
              value={l.key}
              style={{ color: POSTER.ink, background: POSTER.bg }}
            >
              {l.title}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          fontFamily: POSTER.body,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: "0.12em",
          opacity: 0.5,
          marginBottom: 6,
        }}
      >
        THIS PALETTE
      </div>
      <div style={{ border: `2px solid ${ink}` }}>
        {palette.map((c, i) => (
          <div
            key={c.dataId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 8px",
              background: c.hex,
              color: fontColorFor(c.hex),
              borderBottom:
                i < palette.length - 1 ? `1px solid ${ink}` : "none",
            }}
          >
            <span
              style={{
                fontFamily: POSTER.mono,
                fontSize: 10,
                opacity: 0.7,
                flexShrink: 0,
              }}
            >
              {c.hex.toUpperCase()}
            </span>
            <span
              style={{
                fontFamily: POSTER.display,
                fontSize: 14,
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {names[i] || "…"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
