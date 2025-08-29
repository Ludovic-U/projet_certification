import type { Metadata } from "next";
import "../styles/globals.css";
import { oswald, notoSans, didactGothic } from "./fonts";

import Header from "../components/layout/Header"
import SideNav from "../components/layout/SideNav"

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
      <html lang="fr" className={`${oswald.variable} ${notoSans.variable} ${didactGothic.variable} antialiased`}>
        <body>
          {/* <Header/> */}
          {/* <SideNav/> */}
            {children}
        </body>
      </html>
  );
}