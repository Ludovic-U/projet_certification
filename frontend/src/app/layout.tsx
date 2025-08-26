import type { Metadata } from "next";
import "./globals.css";
import { oswald, notoSans, didactGothic } from "./fonts";

import Header from "../components/layout/Header"
import SideNav from "../components/layout/Sidenav"

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
          <Header/>
          <SideNav/>
            {children}
        </body>
      </html>
  );
}