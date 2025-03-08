import type { Metadata } from "next";
import {
  Inter,
  Montserrat,
  Quicksand,
  Playfair_Display,
  Dancing_Script,
} from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});
const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
});

export const metadata: Metadata = {
  title: "Feather Weather",
  description:
    "A beautiful weather application showing current conditions and forecast",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${quicksand.variable} ${playfair.variable} ${dancingScript.variable}`}
    >
      <body className={inter.className}>{children}</body>
    </html>
  );
}
