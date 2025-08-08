import * as React from "react";

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40" onClick={() => onOpenChange(false)}>
            <div className="bg-white rounded-2xl w-[92vw] max-w-md" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}
export function DialogContent({ children }: { children: React.ReactNode }) { return <div className="p-4">{children}</div>; }
export function DialogHeader({ children }: { children: React.ReactNode }) { return <div className="mb-2">{children}</div>; }
export function DialogTitle({ children }: { children: React.ReactNode }) { return <h3 className="text-lg font-semibold">{children}</h3>; }