"use client";

import React, { createContext, useContext, useState } from "react";
import { RadioGroupProps } from "@/components/ui";

const RadioGroupContext = createContext<{
    name: string;
    value: string | undefined;
    setValue: (val: string) => void;
} | null>(null);

export const RadioGroup = ({
    name,
    value: controlledValue,
    defaultValue,
    onValueChange,
    children,
    className,

}: RadioGroupProps) => {
    const [internalValue, setInternalValue] = useState(defaultValue);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const setValue = (val: string) => {
        if (!isControlled) setInternalValue(val);
        onValueChange?.(val);
    };

    return (
        <RadioGroupContext.Provider value={{ name, value, setValue }}>
            <div className={className}>{children}</div>
        </RadioGroupContext.Provider>
    );
};

export const useRadioGroup = () => {
    const ctx = useContext(RadioGroupContext);
    if (!ctx) throw new Error("Radio must be used within a RadioGroup");
    return ctx;
};
