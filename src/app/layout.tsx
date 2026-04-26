import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Butter Milk Distribution Report",
  description: "Track and report daily buttermilk distribution activities at Parvathy Nagar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
