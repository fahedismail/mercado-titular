import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mercado Titular",
  description: "Plataforma de gestão de projeto - Site, Instagram, Facebook, WhatsApp para Mercado.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
