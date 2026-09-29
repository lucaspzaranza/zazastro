import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import Providers from "./providers";
import Image from "next/image";
import Footer from "./components/Footer";
import LanguageSwitcher from "./components/LanguageSwitcher";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zazastro",
  description: "Astrologia Tradicional | Lucas Z",
  icons: { icon: "/pisces.png" },
  openGraph: {
    title: "Zazastro",
    description: "Astrologia Tradicional | Lucas Z",
    url: "https://zazastro.vercel.app/",
    siteName: "Zazastro",
    images: [{ url: "https://zazastro.vercel.app/pisces.png", width: 1200, height: 630, alt: "Preview do Meu Projeto" }],
    locale: "pt_BR",
    type: "website",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("home");

  return (
    <html lang={locale}>
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="min-h-screen sm:min-h-[100vh] flex flex-col items-center justify-between font-[family-name:var(--font-jetbrains-mono)] bg-gradient-to-b from-blue-50 via-slate-50 to-blue-200">
              <div className="relative w-full flex justify-center items-center pt-4">
                <div className="flex flex-row items-center gap-2">
                  <h1 className="text-3xl font-bold">{t("title")}</h1>
                  <Image alt="logo" src="/pisces.png" width={30} height={30} unoptimized />
                </div>
                <div className="absolute right-4">
                  <LanguageSwitcher current={locale} />
                </div>
              </div>
              {children}
              <Footer />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}