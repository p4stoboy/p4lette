import { ComponentType } from "react";
import { BodyProps } from "./styles";
import { HarmonyBody } from "./HarmonyBody";
import { TonesBody } from "./TonesBody";
import { FixersBody } from "./FixersBody";
import { PigmentBody } from "./PigmentBody";
import { MixBody } from "./MixBody";
import { EffectsBody } from "./EffectsBody";
import { GenerateBody } from "./GenerateBody";

export type { BodyProps };
export { subHeaderStyle } from "./styles";

export interface TraySection {
  key: string;
  label: string;
  Body: ComponentType<BodyProps>;
}

// The TOOLS-tray sections, in display order. Adding / renaming / removing a tool
// is a one-line change here — see the SPEC-workflow note in `SPEC/CURRENT/index.md`.
export const TRAY_SECTIONS: readonly TraySection[] = [
  { key: "harmony", label: "HARMONY", Body: HarmonyBody },
  { key: "tones", label: "TONES", Body: TonesBody },
  { key: "fixers", label: "FIXERS", Body: FixersBody },
  { key: "pigment", label: "PIGMENT", Body: PigmentBody },
  { key: "mix", label: "MIX", Body: MixBody },
  { key: "effects", label: "EFFECTS", Body: EffectsBody },
  { key: "shuffle", label: "SHUFFLE SETTINGS", Body: GenerateBody },
];
