import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Partner Quiz",
  description: "A short quiz that generates a partner compatibility report."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
