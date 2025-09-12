import { type ButtonHTMLAttributes, type ReactNode } from "react";

type TestButtonProps = {
    children: ReactNode;
    variant?: "dark" | "colored";
    size?: "small" | "base" | "long" | "large";
    iconLeft?: ReactNode;
    loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function TestButton({
    children,
    variant = "dark",
    size = "base",
    iconLeft,
    loading= false,
    type= "button",
    className,
    disabled,
    ...props
}: TestButtonProps & { type?: "button" | "submit" | "reset"}) {
    const base =
        "font-noto rounded-xl text-light cursor-pointer inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap";

        const variants = {
            dark: "bg-dark hover:bg-darkhover",
            colored: "bg-primary hover:bg-primaryhover",
        } as const;

        const sizes = {
            small: "px-4 py-1",
            base: "px-6 py-2",
            long: "px-9 py-2.5",
            large: "px-6 py-3",
        } as const;

    return (
        <button
         type={type}
         className={`${base} ${variants[variant]} ${sizes[size]} ${className ?? ""}
                    [&_svg]:inline-flex [&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0`}
         disabled={disabled || loading}
         {...props}>

            {loading? (
                <svg
                 className="animate-spin h-4 w-4 text-primary"
                 xmlns="http://www.w3.org/2000/svg"
                 fill="none"
                 viewBox="0 0 24 24">
                    <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4">
                    </circle>
                    <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z">
                    </path>
                </svg>
            ) : (
                <>
                    {iconLeft && <span>{iconLeft}</span>}
                    {children}
                </>
            )}
        </button>
    );
}