import * as React from "react";
export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input className={`w-full border rounded-md px-3 py-2 outline-none focus:ring ${className}`} {...props} />;
}