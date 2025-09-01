import { InputHTMLAttributes } from "react";

export interface ToggleProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
            checked?: boolean;
            defaultChecked?: boolean;
            onCheckedChange?: (checked: boolean) => void;
            label?: string;
            helperText?: string;
            disabled?: boolean;
        }