import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
    [
        "cursor-pointer",
        "inline-flex items-center justify-center gap-2",
        "rounded-lg text-white",
        "whitespace-nowrap",
        "transition-colors duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-green-500",
        "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    ],
    {
        variants: {
            variant: {
                red: "bg-red-500",
                purple: "bg-purple-500",
                blue: "bg-blue-500",
            },
            size: {
                sm: "px-2 py-1",
                md: "px-4 py-2",
            },
        },
        defaultVariants: {
            variant: "red",
            size: "md"
        },
    }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;