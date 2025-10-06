import { SelectHTMLAttributes } from "react";
import { SelectVariantsProps as CVASelectVariantsProps } from "./select.variants";

export type SelectVariantsProps = CVASelectVariantsProps;

export type SelectOption =
    string
    | {
        value: string;
        label: string;
        disabled?: boolean;
    };

export interface SelectProps
    extends SelectHTMLAttributes<HTMLSelectElement>,
        SelectVariantsProps {
            label?: string;
            labelBg?: string;
            error?: string;
            helperText?: string;
            leftIcon?: React.ReactNode;
            loading?: boolean;
            options: SelectOption[];
            placeholder?: string;
        }

export interface MultiSelectProps
    extends Omit<SelectVariantsProps, "size"> {
        label?: string;
        labelBg?: string;
        error?: string;
        helperText?: string;
        leftIcon?: React.ReactNode;
        loading?: boolean;
        disabled?: boolean;
        options: SelectOption[];
        placeholder?: string;
        value?: string[];
        onChange?: (values: string[]) =>void;
        id?: string;
        name?: string;
        required?: boolean;
        className?: string;
    }