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
  const cookieStore = cookies();
  const locale = resolveLocale(cookieStore.get("NEXT_LOCALE")?.value);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
