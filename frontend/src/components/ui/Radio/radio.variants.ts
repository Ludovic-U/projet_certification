import { cva, type VariantProps } from "class-variance-authority"

export const radioVariants = cva(
    [
        "flex items-center justify-center",
        "border-2 border-dark bg-background",
        "rounded-full",
        "transition-all duration-200 ease-in-out",
        "hover:border-primarylighter",
        "peer-focus:border-primary",
        "peer-focus:ring-2 peer-focus:ring-primarylighter",
        "peer-checked:bg-primary peer-checked:border-primary",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        "peer-aria-invalid:border-alertdanger peer-aria-invalid:peer-focus:ring-alertdanger50"
    ],
    {
        variants: {
            size: {
                sm: "w-4 h-4",
                md: "w-5 h-5",
                lg: "w-6 h-6",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

export type RadioVariantsProps = VariantProps<typeof radioVariants>;