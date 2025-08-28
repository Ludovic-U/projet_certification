import { InputHTMLAttributes } from "react";
import { RadioVariants } from "./radio_variants";

export interface RadioProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
        RadioVariants {
            label?: string;
            value: string;
            error?: string;
            helperText?: string;
        }

export interface RadioGroupProps {
    name: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}