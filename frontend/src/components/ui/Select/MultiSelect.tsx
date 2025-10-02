"use client";

import { forwardRef, useId, useState, useRef, useEffect } from "react";
import { cn } from "@/utils/utils";
import { selectVariants } from "./select.variants";
import { MultiSelectProps, SelectOption } from "./select.types";
import { LoadingSpinner } from "../LoadingSpinner";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { Button } from "../Button";

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
    (
        {
            className,
            variant,
            label,
            labelBg,
            error,
            helperText,
            leftIcon,
            loading = false,
            disabled,
            id,
            options = [],
            placeholder,
            value = [],
            onChange,
            name,
            required,
        },
        ref
    ) => {
        const generateId = useId();
        const selectId = id || generateId;

        const [isOpen, setIsOpen] = useState(false);
        const [selectedValues, setSelectedValues] = useState<string[]>(value);
        const containerRef = useRef<HTMLDivElement>(null);

        const effectiveVariant = error ? "error" : variant;
        const isDisabled = disabled || loading;

        useEffect(() => {
            setSelectedValues(value);
        }, [value]);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const getOptionLabel = (optionValue: string): string => {
            const option = options.find(opt =>
                typeof opt === "string" ? opt === optionValue : opt.value === optionValue
            );
            if (!option) return optionValue;
            return typeof option === "string" ? option : option.label;
        };

        const handleToggleOption = (optionValue: string) => {
            const newValues = selectedValues.includes(optionValue)
                ? selectedValues.filter(v => v !== optionValue)
                : [...selectedValues, optionValue];

            setSelectedValues(newValues);
            onChange?.(newValues);
        };

        const handleRemoveValue = (valueToRemove: string, e: React.MouseEvent) => {
            e.stopPropagation();
            const newValues = selectedValues.filter(v => v !== valueToRemove);
            setSelectedValues(newValues);
            onChange?.(newValues);
        };

        return (
            <div ref={ref} className="w-full">
                <div className="relative" ref={containerRef}>
                    {label && (
                        <div className="absolute z-20 -top-3.5 left-3">
                            <div className={cn(
                               "absolute h-0.5 w-full top-3/5",
                               labelBg ?? "bg-light"
                            )}/>
                            <label
                             htmlFor={selectId}
                             className={cn(
                                "relative px-1 text-greydarker font-didact text-sm",
                                labelBg ?? "bg-light"
                             )}
                            >
                                {required && (
                                    <span className="text-alertdanger mr-1 font-bold">
                                        *
                                    </span>
                                )}
                                {label}
                            </label>
                        </div>
                    )}

                    {name && selectedValues.map((val) => (
                        <input
                         key={val}
                         type="hidden"
                         name={name}
                         value={val}
                        />
                    ))}

                    <div
                     id={selectId}
                     className={cn(
                        selectVariants({ variant: effectiveVariant }),
                        "min-h-[42px] max-h-20 overflow-y-scroll cursor-pointer",
                        leftIcon && "pl-10",
                        loading && "pr-10",
                        isDisabled && "opacity-50 cursor-not-allowed",
                        className
                     )}
                     onClick={() => !isDisabled && setIsOpen(!isOpen)}
                     aria-expanded={isOpen}
                     aria-haspopup="listbox"
                     role="combobox"
                    >
                        <div className="flex flex-wrap gap-2 items-center">
                            {selectedValues.length === 0 ? (
                                <span className="text-grey">{placeholder}</span>
                            ) : (
                                selectedValues.map((val) => (
                                    <div
                                     key={val}
                                     className="flex items-center gap-1 bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm font-bold">
                                        <span>{getOptionLabel(val)}</span>
                                        <Button
                                         size="iconXS"
                                         onClick={(e) => handleRemoveValue(val, e)}
                                         disabled={isDisabled}>
                                            <FontAwesomeIcon icon={Icons.xmark}/>
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-grey pointer-events-none">
                            {leftIcon}
                        </div>
                    )}

                    {loading && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-grey pointer-events-none">
                            <LoadingSpinner/>
                        </div>
                    )}

                    {isOpen && !isDisabled && (
                        <div className="absolute z-30 w-full mt-1 bg-light border border-dark rounded-lg shadow-400 max-h-60 overflow-auto">
                            {options.map((option) => {
                                const optionValue = typeof option === "string" ? option : option.value;
                                const optionLabel = typeof option === "string" ? option : option.label;
                                const isDisabledOption = typeof option === "object" && option.disabled;
                                const isSelected = selectedValues.includes(optionValue);

                                return (
                                    <div
                                     key={optionValue}
                                     className={cn(
                                        "px-3 py-2 cursor-pointer font-noto text-base",
                                        isSelected && "bg-primary/10 text-primary",
                                        !isSelected && "hover:bg-lighthover text-dark",
                                        isDisabledOption && "opacity-50 cursor-not-allowed"
                                     )}
                                     onClick={() => !isDisabledOption && handleToggleOption(optionValue)}
                                     role="option"
                                     aria-selected={isSelected}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-4 h-4 border-2 rounded flex items-center justify-center",
                                                isSelected ? "border-primary bg-primary" : "border-grey"
                                            )}>
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-light" fill="currentColor" viewBox="0 0 12 12">
                                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <span>{optionLabel}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {error && (
                    <p
                     id={`${selectId}-error`}
                     className="m-2 text-base text-alertdanger font-didact cursor-default"
                     role="alert">
                        {error}
                    </p>
                )}

                {helperText && !error && (
                    <p
                     id={`${selectId}-helper`}
                     className="mt-2 text-base font-didact text-dark cursor-default">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

MultiSelect.displayName = "MultiSelect";