import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Providers from "./providers";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zazastro",
  description: "Astrologia Tradicional | Lucas Z",
  icons: {
    icon: "pisces.png",
  },
  openGraph: {
    title: "Zazastro",
    description: "Astrologia Tradicional | Lucas Z",
    url: "https://zazastro.vercel.app/",
    siteName: "Zazastro",
    images: [
      {
        url: "https://zazastro.vercel.app/preview.png", // coloque esse arquivo em /public
        width: 1200,
        height: 630,
        alt: "Preview do Meu Projeto",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
