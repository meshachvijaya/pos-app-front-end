import * as React from "react";

type Ctx = { value?: string; onValueChange?: (v: string) => void; name: string };
const RGContext = React.createContext<Ctx | null>(null);

export function RadioGroup({
                               value,
                               onValueChange,
                               className,
                               children,
                           }: {
    value?: string;
    onValueChange?: (v: string) => void;
    className?: string;
    children?: React.ReactNode;
}) {
    const name = React.useId();
    return (
        <RGContext.Provider value={{ value, onValueChange, name }}>
            <div role="radiogroup" className={className}>
                {children}
            </div>
        </RGContext.Provider>
    );
}

export function RadioGroupItem(
    {
        value,
        id,
        ...props
    }: { value: string; id?: string } & Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "type" | "onChange" | "checked" | "name"
    >
) {
    const ctx = React.useContext(RGContext);
    const checked = ctx?.value === value;
    return (
        <input
            type="radio"
            role="radio"
            aria-checked={checked}
            name={ctx?.name}
            id={id ?? value}
            checked={checked}
            onChange={() => ctx?.onValueChange?.(value)}
            {...props}
        />
    );
}