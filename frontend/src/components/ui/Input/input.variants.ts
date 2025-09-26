import { cva, type VariantProps } from "class-variance-authority"

export const inputVariants = cva(
    [
        "flex w-full rounded-lg",
        "bg-background border border-dark",
        "px-3 py-2 ",
        "text-base font-noto text-dark",
        "hover:border-dashed hover:border-primary",
        "focus:outline-none focus:border-solid focus:border-primary",
    ],
    {
        variants: {
            variant: {
                error: "border-alertdanger bg-alertdanger50",
                success: "border-alertsuccess bg-alertsuccess50",
            },
        },
    }
)

export type InputVariantsProps = VariantProps<typeof inputVariants>