interface Props {
  ink: string;
  hexes: string[];
}

// Two thin full-width strips: hard-stop blocks, then a smooth gradient.
export const ShareLine = ({ ink, hexes }: Props) => (
  <div style={{ padding: 20 }}>
    <div style={{ display: "flex", height: 24, border: `1px solid ${ink}` }}>
      {hexes.map((h, i) => (
        <div key={i} style={{ flex: 1, background: h }} />
      ))}
    </div>
    <div
      style={{
        height: 24,
        marginTop: 8,
        border: `1px solid ${ink}`,
        background: `linear-gradient(90deg, ${hexes.join(", ")})`,
      }}
    />
  </div>
);
