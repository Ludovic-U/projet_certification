import { cva, type VariantProps } from "class-variance-authority"

export const checkboxVariants = cva(
    [
        "relative inline-flex items-center gap-2 cursor-pointer",
        "font-noto text-dark text-base",
    ],
    {
        variants: {
            size: {
                sm: "text-sm",
                default: "text-base",
                lg: "text-lg",
            }
        },
        defaultVariants: {
            size: "default",
        },
    }
)

export const checkboxInputVariants = cva(
    [
        "sr-only peer"
    ]
)

export const checkboxBoxVariants = cva(
    [
        "relative inline-flex items-center justify-center shrink-0",
        "border border-input bg-background",
        "rounded-md",
        "transition-all duration-200 ease-in-out",

        "hover:ring-2 hover:ring-primarylighter hover:border-primarylighter",

        "peer-focus:border-2 peer-focus:border-primary",
        "peer-focus:ring-2 peer-focus:ring-primarylighter",

        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",

        "peer-checked:bg-primary peer-checked:border-primary peer-checked:text-primary-foreground",

        "peer-aria-invalid:border-alertdanger peer-aria-invalid:peer-focus:ring-alertdanger/20"
    ],
    {
        variants: {
            size: {
                sm: "size-4",
                default: "size-5",
                lg: "size-6",
            }
        },
        defaultVariants: {
            size: "default",
        },
    }
)

export type CheckboxVariantProps = VariantProps<typeof checkboxVariants>