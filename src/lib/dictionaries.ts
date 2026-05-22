import ar from "../dictionaries/ar.json";
import en from "../dictionaries/en.json";

export type Dictionary = typeof ar;

export const dictionaries = {
  ar,
  en,
};

export const getDictionary = (locale: string): Dictionary => {
  return dictionaries[locale as "ar" | "en"] || dictionaries.ar;
};
