import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "default";
    size?: "sm" | "md" | "lg";
};

export function Button({ className = "", variant = "default", size = "md", ...props }: Props) {
    const base =
        "rounded-md border text-sm transition active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed";
    const variants = variant === "outline" ? "bg-white hover:bg-gray-50" : "bg-black text-white hover:bg-gray-800";
    const sizes = size === "sm" ? "px-2 py-1" : size === "lg" ? "px-4 py-3" : "px-3 py-2";
    return <button className={`${base} ${variants} ${sizes} ${className}`} {...props} />;
}