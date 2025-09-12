import { InputHTMLAttributes } from "react";
import { RadioVariantsProps } from "./radio.variants";

export interface RadioProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
        RadioVariantsProps {
    label?: string;
    value: string;
    error?: string;
    helperText?: string;
}

export interface RadioGroupProps
    extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: RadioProps["value"]) => void;
    children: React.ReactNode;
    className?: string;
}
