import type { Metadata } from "next";
import { Kalam, Patrick_Hand } from "next/font/google";
import "./globals.css";

const fontJournal = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-journal"
});

const fontLetter = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-letter"
});

export const metadata: Metadata = {
  title: "Know Your Partner · a little journal",
  description:
    "Ten gentle questions about love and connection, turned into a note you can share."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontJournal.variable} ${fontLetter.variable}`}
    >
      <body className="font-journal">{children}</body>
    </html>
  );
}
