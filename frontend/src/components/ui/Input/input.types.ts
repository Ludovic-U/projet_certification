import { InputHTMLAttributes } from "react";
import { InputVariantsProps as CVAInputVariantsProps } from "./input.variants"

export type InputVariantsProps = CVAInputVariantsProps;

export interface InputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
        InputVariantsProps {
            label?: string;
            error?: string;
            helperText?: string;
            leftIcon?: React.ReactNode;
            rightIcon?: React.ReactNode;
            loading?: boolean;
        }