import { createContext, type ReactNode, useCallback, useContext, useState } from "react";
import { de } from "../i18n/de";
import { en } from "../i18n/en";
import { fr } from "../i18n/fr";
import { ja } from "../i18n/ja";
import { ko } from "../i18n/ko";
import type { Locale, Translations } from "../i18n/types";
import { zh } from "../i18n/zh";

const translations: Record<Locale, Translations> = { ja, en, de, fr, zh, ko };

const LOCALES: { code: Locale; label: string }[] = [
	{ code: "ja", label: "日本語" },
	{ code: "en", label: "English" },
	{ code: "de", label: "Deutsch" },
	{ code: "fr", label: "Français" },
	{ code: "zh", label: "中文" },
	{ code: "ko", label: "한국어" },
];

const validLocales = new Set<string>(LOCALES.map((l) => l.code));

function getInitialLocale(): Locale {
	const stored = localStorage.getItem("locale");
	if (stored && validLocales.has(stored)) return stored as Locale;
	return "ja";
}

interface LocaleContextValue {
	locale: Locale;
	t: Translations;
	locales: { code: Locale; label: string }[];
	setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

	const setLocale = useCallback((newLocale: Locale) => {
		setLocaleState(newLocale);
		localStorage.setItem("locale", newLocale);
	}, []);

	const t = translations[locale];

	return (
		<LocaleContext.Provider value={{ locale, t, locales: LOCALES, setLocale }}>
			{children}
		</LocaleContext.Provider>
	);
}

export function useLocale() {
	const ctx = useContext(LocaleContext);
	if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
	return ctx;
}
