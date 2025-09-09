import type { Metadata } from "next";
import "../styles/globals.css";
import { oswald, notoSans, didactGothic } from "./fonts";
import ClientLayout from "@/components/layout/ClientLayout";

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
        <body className="bg-light">
          {/* <ClientLayout>{children}</ClientLayout> */}
          {children}
        </body>
      </html>
  );
}