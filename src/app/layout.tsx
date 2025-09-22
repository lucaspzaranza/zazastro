import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
