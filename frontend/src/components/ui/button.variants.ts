import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
    [
        "cursor-pointer",
        "inline-flex items-center justify-center gap-2 rounded-lg w-fit",
        "font-noto text-light hover:text-lighthover",
        "bg-dark hover:bg-darkhover",
        "whitespace-nowrap",
        "transition-colors duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-primarylighter",
        "disabled:pointer-events-not-allowed disabled:opacity-50 disabled:cursor-default disabled:hover:border-none",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    ],
    {
        variants: {
            variant: {
                iconRound: [
                    "bg-light rounded-full text-dark",
                    "border border-dark",
                    "hover:bg-lighthover hover:text-darkhover",
                    "focus:ring-0",
                ],
                iconRoundClose: [
                    "bg-primary rounded-full",
                    "hover:bg-primaryhover hover:text-lighthover",
                ],
                secondary: [
                    "bg-primary",
                    "uppercase font-bold text-sm",
                    "hover:bg-primaryhover",
                ],
                iconPrimary: [
                    "group font-normal text-sm text-left leading-tight"
                ],
                nav: [
                    "hover:bg-lighthover hover:text-primaryhover",
                ],
                pagination: [
                    "rounded-full bg-transparent hover:-bg-transparent hover:text-dark text-dark hover:border hover:border-primarylight"
                ],
                paginationActive: [
                    "rounded-full text-light bg-primary hover:bg-primary"
                ]
            },
            collapsed: {
                true: "", // navbar fermée
                false: "", // navbar ouverte
            },
            state: {
                active: "", // sur page concernée
                inactive: "", // pas sur la page
            },
            size: {
                pagination: "h-6 w-6",
                smRound: "h-7 w-7",
                xs: "px-2 py-1.5",
                sm: "px-4 py-2",
                md: "px-6 py-2",
                lg: "pl-3 pr-10 py-2 text-sm",
            },
        },
        defaultVariants: {
            size: "md"
        },
    }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;