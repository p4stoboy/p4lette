import { RefObject, useLayoutEffect, useState } from "react";

interface Options {
  names: string[];
  containerRef: RefObject<HTMLElement | null>;
  columnCount: number;
  paddingX: number;
  maxFontSize: number;
  minFontSize: number;
  fontFamily: string;
  fontWeight: number;
  letterSpacing: string;
  uppercase?: boolean;
}

const longestWord = (words: string[]): string =>
  words.reduce((a, b) => (b.length > a.length ? b : a), "");

const measureWordWidthAt100 = (
  word: string,
  fontFamily: string,
  fontWeight: number,
  letterSpacing: string,
  uppercase: boolean,
): number => {
  const span = document.createElement("span");
  Object.assign(span.style, {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    top: "-9999px",
    left: "-9999px",
    whiteSpace: "nowrap",
    fontFamily,
    fontWeight: String(fontWeight),
    letterSpacing,
    textTransform: uppercase ? "uppercase" : "none",
    fontSize: "100px",
    lineHeight: "1",
  });
  span.textContent = word;
  document.body.appendChild(span);
  const w = span.getBoundingClientRect().width;
  document.body.removeChild(span);
  return w;
};

const NAMES_DELIM = "";

export const useFitNameSize = ({
  names,
  containerRef,
  columnCount,
  paddingX,
  maxFontSize,
  minFontSize,
  fontFamily,
  fontWeight,
  letterSpacing,
  uppercase = true,
}: Options): number => {
  const [size, setSize] = useState(maxFontSize);
  const namesKey = names.join(NAMES_DELIM);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const allWords = namesKey
        .split(NAMES_DELIM)
        .flatMap((n) => n.split(/\s+/).filter(Boolean));
      const longest = longestWord(allWords);
      if (!longest) {
        setSize(maxFontSize);
        return;
      }
      const cols = Math.max(1, columnCount);
      const colInnerWidth = el.clientWidth / cols - paddingX * 2;
      if (colInnerWidth <= 0) return;

      const widthAt100 = measureWordWidthAt100(
        longest,
        fontFamily,
        fontWeight,
        letterSpacing,
        uppercase,
      );
      if (widthAt100 <= 0) return;

      const ideal = (colInnerWidth / widthAt100) * 100;
      const clamped = Math.max(
        minFontSize,
        Math.min(maxFontSize, Math.floor(ideal)),
      );
      setSize(clamped);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    namesKey,
    columnCount,
    paddingX,
    maxFontSize,
    minFontSize,
    fontFamily,
    fontWeight,
    letterSpacing,
    uppercase,
    containerRef,
  ]);

  return size;
};
