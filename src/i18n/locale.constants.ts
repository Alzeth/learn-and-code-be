export const SUPPORTED_LOCALES = ['en', 'uk', 'de', 'es', 'pl', 'fr', 'it'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'en';

export function resolveLocale(raw: string | undefined): SupportedLocale {
  if (!raw) return DEFAULT_LOCALE;
  //Accept-Language can be "uk,en-US;q=0.9" — take the first tag's language subtag
  const lang = raw.split(',')[0].split(';')[0].trim().slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as readonly string[]).includes(lang)
    ? (lang as SupportedLocale)
    : DEFAULT_LOCALE;
}
