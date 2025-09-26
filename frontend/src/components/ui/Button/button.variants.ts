import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
    [
        "cursor-pointer w-fit h-fit",
        "inline-flex items-center justify-center gap-2",
        "font-noto rounded-lg",
        "whitespace-nowrap",
        "transition-colors duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-primarylighter",
        "disabled:pointer-events-not-allowed disabled:opacity-50 disabled:cursor-default",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    ],
    {
        variants: {
            variant: {
                primary: [
                    "text-light hover:text-lighthover",
                    "bg-dark hover:bg-darkhover",
                    "border-2 border-dark hover:border-darkhover"
                ],
                secondary: [
                    "text-light hover:text-lighthover",
                    "bg-primary hover:bg-primaryhover",
                    "border-2 border-primary hover:border-primaryhover",
                ],
                primaryBorder: [
                    "text-dark",
                    "bg-transparent hover:bg-dark/50",
                    "border-2 border-dark hover:border-darkhover"
                ],
                secondaryBorder: [
                    "text-primary hover:text-primaryhover",
                    "bg-transparent hover:bg-primary/50",
                    "border-2 border-primary hover:border-primaryhover"
                ],
                icon: [
                    "text-light hover:text-lighthover",
                    "rounded-full",
                    "bg-dark",
                ],
            },
            size: {
                xs: "px-2 py-1.5 text-xs border-1",
                sm: "px-3 py-1 text-sm",
                md: "px-6 py-2",
                icon: "h-8 w-8 p-3 border-1 rounded-full",
                iconS: "h-6 w-6 border-1 rounded-full text-xs",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md"
        },
    }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;