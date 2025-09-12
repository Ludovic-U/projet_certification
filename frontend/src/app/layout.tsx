import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/ui/header"
import { oswald, notoSans, didactGothic } from "./fonts";

export const metadata: Metadata = {
  title: "F2S_APP",
  description: "l'appli d'aide à la création et gestion de projet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="fr">
        <body className={`${oswald.variable} ${notoSans.variable} ${didactGothic.variable} antialiased`}>          
          <Header></Header>
          {children}
        </body>
      </html>
  );
}
