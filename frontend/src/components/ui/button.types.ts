import { ButtonHTMLAttributes, ReactNode } from "react";
import { ButtonVariantProps as CVAButtonVariantProps } from "./button.variants";

export type ButtonVariantProps = CVAButtonVariantProps;

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        ButtonVariantProps {
            children: ReactNode
            asChild?: boolean
            loading?: boolean
        }