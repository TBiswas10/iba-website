import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const locales = ["en", "bn"] as const;
const defaultLocale = "en";

type Locale = (typeof locales)[number];

function resolveLocale(value: string | undefined): Locale {
  if (value === "bn" || value === "en") {
    return value;
  }
  return defaultLocale;
}

export default getRequestConfig(async () => {
  let locale: Locale = defaultLocale;
  
  try {
    const cookieStore = cookies();
    locale = resolveLocale(cookieStore.get("NEXT_LOCALE")?.value);
  } catch {
    // Cookies not available during build, use default
  }

  let messages = {};
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    // Fallback to empty messages if import fails
  }

  return {
    locale,
    messages,
  };
});
