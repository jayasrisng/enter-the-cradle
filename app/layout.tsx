import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enter the Cradle",
  description:
    "A personalized immersive experience where you become part of a cinematic Niiro ride.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
