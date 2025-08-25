import { Oswald, Noto_Sans, Didact_Gothic } from "next/font/google";

export const oswald = Oswald ({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-oswald",
});

export const notoSans = Noto_Sans({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-notosans",
});

export const didactGothic = Didact_Gothic({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-didactgothic",
});