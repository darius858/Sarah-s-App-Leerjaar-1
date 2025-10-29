import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sarah's App Leerjaar 1",
  description: "Wiskunde leren met Sarah's App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
