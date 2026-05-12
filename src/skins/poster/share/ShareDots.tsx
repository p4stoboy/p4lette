interface Props {
  ink: string;
  hexes: string[];
}

// A centred wrapping row of N circles (hex on hover).
export const ShareDots = ({ ink, hexes }: Props) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 16,
      justifyContent: "center",
      padding: 32,
    }}
  >
    {hexes.map((h, i) => (
      <div
        key={i}
        title={h.toUpperCase()}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: h,
          border: `2px solid ${ink}`,
        }}
      />
    ))}
  </div>
);
