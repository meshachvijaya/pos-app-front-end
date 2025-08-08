"use client";
import {useState} from "react";
import {Button} from "@/components/button";
import {Card, CardContent} from "@/components/card";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/dialog";
import {Checkbox} from "@/components/checkbox";
import {RadioGroup, RadioGroupItem} from "@/components/radio-group";
import {Input} from "@/components/input";

// IDR formatter
const nfIDR = new Intl.NumberFormat("id-ID", {maximumFractionDigits: 0});
const formatIDR = (n: number) => nfIDR.format(n);

// Data type for menu, variant, addon, order
export type Variant = { name: string; price: number };
export type Addon = { name: string; price: number };
export type MenuItem = { id: number; name: string; price: number; variants: Variant[]; addons: Addon[] };
export type OrderItem = { id: number; name: string; price: number; qty: number; addons: Addon[]; note?: string };

// Dummy data
const sampleMenu: MenuItem[] = [
    {
        id: 1,
        name: "Americano",
        price: 20000,
        variants: [{name: "Hot", price: 0}, {name: "Iced", price: 2000}],
        addons: [{name: "Extra Shot", price: 3000}, {name: "Oat Milk", price: 5000}]
    },
    {
        id: 2,
        name: "Thai Tea",
        price: 18000,
        variants: [{name: "Regular", price: 0}, {name: "Large", price: 4000}],
        addons: []
    },
    {
        id: 3,
        name: "Chicken Rice Bowl",
        price: 35000,
        variants: [],
        addons: [{name: "Extra Chili", price: 0}, {name: "Sunny Side Egg", price: 6000}]
    },
    {
        id: 4,
        name: "Latte",
        price: 18000,
        variants: [{name: "Regular", price: 0}, {name: "Large", price: 4000}],
        addons: []
    },

];

export default function POS() {
    // Data order state
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    // State for variant/add-on modal
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [note, setNote] = useState<string>("");

    // State for payment modal
    const [payModal, setPayModal] = useState<boolean>(false);
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "TRANSFER">("CASH");
    const [paidAmount, setPaidAmount] = useState<number>(0);

    // User click menu -> open modal for variant/add-on
    const openModal = (item: MenuItem) => {
        setSelectedItem(item);
        setSelectedVariant(item.variants[0]?.name ?? null);
        setSelectedAddons([]);
        setNote("");
        setModalOpen(true);
    };

    // Add order
    const addToOrder = () => {
        if (!selectedItem) return;
        const variantObj = selectedItem.variants?.find((v) => v.name === selectedVariant);
        const addonObjs: Addon[] = selectedItem.addons?.filter((a) => selectedAddons.includes(a.name)) ?? [];
        const variantPrice = variantObj?.price ?? 0;
        const addonTotal = addonObjs.reduce((sum: number, a: Addon) => sum + a.price, 0);
        const finalPrice = selectedItem.price + variantPrice + addonTotal;

        const newItem: OrderItem = {
            id: Date.now(),
            name: `${selectedItem.name}${selectedVariant ? ` (${selectedVariant})` : ""}`,
            price: finalPrice,
            qty: 1,
            addons: addonObjs,
            note: note.trim() || undefined,
        };

        setOrderItems((prev) => [...prev, newItem]);
        setModalOpen(false);
    };

    const incrementQty = (id: number) => setOrderItems((prev) => prev.map((x) => (x.id === id ? {
        ...x,
        qty: x.qty + 1
    } : x)));
    const decrementQty = (id: number) => setOrderItems((prev) => prev.map((x) => (x.id === id ? {
        ...x,
        qty: x.qty - 1
    } : x)).filter((x) => x.qty > 0));

    const total = orderItems.reduce((sum: number, x: OrderItem) => sum + x.qty * x.price, 0);
    const change = paidAmount - total;

    const submitOrder = async () => {
        const res = await fetch("/api/order", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                items: orderItems.map((o) => ({
                    name: o.name,
                    qty: o.qty,
                    price: o.price,
                    addons: o.addons,
                    note: o.note
                })),
                paymentMethod,
                paidAmount,
                total,
            }),
        });
        if (!res.ok) alert("Gagal menyimpan order");
    };

    const resetOrder = async () => {
        await submitOrder();
        setOrderItems([]);
        setPaidAmount(0);
        setPaymentMethod("CASH");
        setPayModal(false);
    };

    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
                <h2 className="text-xl font-bold mb-2">Menu</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {sampleMenu.map((item) => (
                        <Card key={item.id} onClick={() => openModal(item)}
                              className="p-4 hover:bg-slate-100 cursor-pointer">
                            <CardContent>
                                <h4 className="font-semibold">{item.name}</h4>
                                <p>Rp {formatIDR(item.price)}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-2">Order</h2>
                <div className="border rounded p-4 min-h-[300px]">
                    {orderItems.length === 0 && <p>No items selected.</p>}
                    {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2">
                            <div>
                                <p className="font-medium">{item.name}</p>
                                {item.addons?.length > 0 &&
                                    <p className="text-xs text-muted-foreground">+ {item.addons.map((a) => a.name).join(", ")}</p>}
                                {item.note && <p className="text-xs italic text-muted-foreground">"{item.note}"</p>}
                                <p className="text-sm text-muted">Rp {formatIDR(item.qty * item.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => decrementQty(item.id)}>-</Button>
                                <span className="px-2 font-medium">{item.qty}</span>
                                <Button size="sm" variant="outline" onClick={() => incrementQty(item.id)}>+</Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-right">
                    <h3 className="text-lg font-semibold">Total: Rp {formatIDR(total)}</h3>
                    <Button className="mt-2 w-full" disabled={orderItems.length === 0}
                            onClick={() => setPayModal(true)}>Bayar</Button>
                </div>
            </div>

            {/* Modal: Varian & Add-on */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Tambah ke Order</DialogTitle></DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4">
                            <p className="font-semibold">{selectedItem.name}</p>
                            {selectedItem.variants?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Pilih Varian</h4>
                                    <RadioGroup value={selectedVariant ?? undefined}
                                                onValueChange={(v) => setSelectedVariant(v)} className="space-y-2">
                                        {selectedItem.variants.map((v: Variant) => (
                                            <div key={v.name} className="flex items-center gap-2">
                                                <RadioGroupItem value={v.name} id={v.name}/>
                                                <label htmlFor={v.name}
                                                       className="text-sm">{v.name} {v.price > 0 && `(+Rp ${v.price.toLocaleString()})`}</label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            )}
                            {selectedItem.addons?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-1">Tambah Add-on</h4>
                                    <div className="space-y-1">
                                        {selectedItem.addons.map((a: Addon) => (
                                            <div key={a.name} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={a.name}
                                                    checked={selectedAddons.includes(a.name)}
                                                    onCheckedChange={(checked: boolean) => setSelectedAddons((prev) => checked ? [...prev, a.name] : prev.filter((n) => n !== a.name))}
                                                />
                                                <label htmlFor={a.name}
                                                       className="text-sm">{a.name} {a.price > 0 && `(+Rp ${a.price.toLocaleString()})`}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <h4 className="text-sm font-medium mb-1">Catatan Khusus</h4>
                                <Input placeholder="Contoh: tanpa gula, extra es" value={note}
                                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}/>
                            </div>
                            <Button onClick={addToOrder} className="w-full">Tambah</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal: Pembayaran */}
            <Dialog open={payModal} onOpenChange={setPayModal}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Pembayaran</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <RadioGroup value={paymentMethod}
                                    onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}>
                            <div className="flex items-center gap-2"><RadioGroupItem value="CASH" id="cash"/><label
                                htmlFor="cash">Cash</label></div>
                            <div className="flex items-center gap-2"><RadioGroupItem value="QRIS" id="qris"/><label
                                htmlFor="qris">QRIS</label></div>
                            <div className="flex items-center gap-2"><RadioGroupItem value="TRANSFER" id="tf"/><label
                                htmlFor="tf">Transfer</label></div>
                        </RadioGroup>
                        <div>
                            <label className="text-sm font-medium">Jumlah Dibayar</label>
                            <Input type="number" value={Number.isFinite(paidAmount) ? paidAmount : 0}
                                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                       const val = Number(e.target.value);
                                       setPaidAmount(Number.isFinite(val) ? val : 0);
                                   }} placeholder="Rp"/>
                        </div>
                        <div className="text-right">
                            <p className="text-sm">Total: Rp {total.toLocaleString()}</p>
                            <p className="text-sm font-semibold">Kembalian: Rp {formatIDR(Math.max(change, 0))}</p>
                        </div>
                        <Button disabled={paidAmount < total} onClick={resetOrder} className="w-full">Selesai & Cetak</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}