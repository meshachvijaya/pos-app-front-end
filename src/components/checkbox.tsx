import * as React from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "checked"> & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
};

export function Checkbox({ checked, onCheckedChange, ...props }: Props) {
    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            {...props}
        />
    );
}