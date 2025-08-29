import { InputHTMLAttributes } from "react";
import { ToggleVariantProps } from "./toggle.variants";

export interface ToggleProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
        ToggleVariantProps {
            checked?: boolean;
            defaultChecked?: boolean;
            onCheckedChange?: (checked: boolean) => void;
            label?: string;
            helperText?: string;
        }