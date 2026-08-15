import type { Locale } from "../config";
import { en } from "./en";
import { ja } from "./ja";
import { ko } from "./ko";
import type { Dictionary } from "./types";
import { zh } from "./zh";

const DICTIONARIES: Record<Locale, Dictionary> = { ko, en, ja, zh };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export type { Dictionary };
