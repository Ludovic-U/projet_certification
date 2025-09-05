import { InputHTMLAttributes } from "react";
import { CheckboxVariantProps } from "./checkbox.variants";

export interface CheckboxProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
        CheckboxVariantProps {
            label?: string;
            error?: string;
            helperText?: string;
            checked?: boolean;
            onCheckedChange?: (checked: boolean) => void;
        }