"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Pencil, X, Check, Trash2, ChevronLeft, ChevronRight, Search, FileDown } from "lucide-react";
import { toDisplayDateTime, nowDateTimeLocal } from "@/lib/utils";
import ShopDropdown, { ShopOption } from "@/components/ui/ShopDropdown";
import DateTimeInput from "../ui/DateTimeInput";
import ExportModal from "@/components/ui/ExportModal";
import { IBill } from "@/types";

interface Bill {
    _id: string;
    billNo: string;
    shop: ShopOption;
    vehicleNo: string;
    printDate: string;
    material: string;
    grossWeight: number;
    grossTime: string;
    tareWeight: number;
    tareTime: string;
    netWeight: number;
    weighmentCharges: number;
    operatorSign: string;
}

const PAGE_SIZE = 15;

export default function HistoryTab() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [shops, setShops] = useState<ShopOption[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [page, setPage] = useState(1);

    const [editBill, setEditBill] = useState<Bill | null>(null);
    const [editForm, setEditForm] = useState<Partial<Bill>>({});
    const [saving, setSaving] = useState(false);

    const [deleteBill, setDeleteBill] = useState<Bill | null>(null);
    const [deleting, setDeleting] = useState(false);

    // export
    const [exportTarget, setExportTarget] = useState<Bill | null>(null);

    async function load() {
        setLoading(true);
        try {
            const [billsRes, shopsRes] = await Promise.all([fetch("/api/bills"), fetch("/api/shops")]);
            const billsData = await billsRes.json();
            const shopsData = await shopsRes.json();
            if (billsData.success) setBills(billsData.data);
            if (shopsData.success) setShops(shopsData.data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);
    useEffect(() => {
        setPage(1);
    }, [search, fromDate, toDate]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return bills.filter((b) => {
            if (q) {
                const matchBill = b.billNo.toLowerCase().includes(q);
                const matchVehicle = b.vehicleNo?.toLowerCase().includes(q);
                if (!matchBill && !matchVehicle) return false;
            }
            if (fromDate && new Date(b.printDate) < new Date(fromDate)) return false;
            if (toDate) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                if (new Date(b.printDate) > end) return false;
            }
            return true;
        });
    }, [bills, search, fromDate, toDate]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function openEdit(bill: Bill) {
        setEditBill(bill);
        setEditForm({
            shop: bill.shop,
            vehicleNo: bill.vehicleNo,
            printDate: bill.printDate,
            material: bill.material,
            grossWeight: bill.grossWeight,
            grossTime: bill.grossTime,
            tareWeight: bill.tareWeight,
            tareTime: bill.tareTime,
            weighmentCharges: bill.weighmentCharges,
        });
    }

    async function handleSave() {
        if (!editBill) return;
        setSaving(true);
        try {
            const shopId = typeof editForm.shop === "object" ? (editForm.shop as ShopOption)._id : editForm.shop;
            const res = await fetch(`/api/bills/${editBill._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...editForm, shop: shopId }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Bill updated");
                setEditBill(null);
                load();
            } else {
                toast.error(data.error ?? "Failed to update");
            }
        } finally {
            setSaving(false);
        }
    }

    function ef(field: string, value: string | number | ShopOption) {
        setEditForm((f) => ({ ...f, [field]: value }));
    }

    async function handleDelete() {
        if (!deleteBill) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/bills/${deleteBill._id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success(`Bill #${deleteBill.billNo} deleted`);
                setDeleteBill(null);
                load();
            } else {
                toast.error(data.error ?? "Failed to delete");
            }
        } finally {
            setDeleting(false);
        }
    }

    const gross = Number(editForm.grossWeight) || 0;
    const tare = Number(editForm.tareWeight) || 0;

    if (loading) return <div className="p-6 text-xs text-neutral-400">Loading...</div>;

    return (
        <div className="p-4 md:p-6 space-y-4">
            <h2 className="text-xs font-bold tracking-widest uppercase">Bill History</h2>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 min-w-0">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search bill no. or vehicle..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border border-black pl-7 pr-3 py-1.5 text-xs font-mono placeholder:text-neutral-400 focus:outline-none"
                    />
                </div>
                <div className="flex gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 border border-black px-2 py-1.5">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 shrink-0">
                            From
                        </span>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="text-xs font-mono focus:outline-none w-[120px]"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 border border-black px-2 py-1.5">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 shrink-0">
                            To
                        </span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="text-xs font-mono focus:outline-none w-[120px]"
                        />
                    </div>
                    {(search || fromDate || toDate) && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setFromDate("");
                                setToDate("");
                            }}
                            className="border border-black px-2 py-1.5 text-xs hover:bg-black hover:text-white"
                            title="Clear filters"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Table ── */}
            {filtered.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4">
                    {bills.length === 0 ? "No bills yet." : "No bills match your search."}
                </p>
            ) : (
                <>
                    <div className="border border-black overflow-x-auto">
                        <table className="w-full text-xs">
<thead>
  <tr className="border-b border-black bg-neutral-50">
    <th className="sticky left-0 z-10 bg-neutral-50 text-left px-3 md:px-4 py-3 font-bold tracking-widest uppercase whitespace-nowrap">
      Bill No.
    </th>
    {["Vehicle", "Shop", "Date", "Net (KG)", ""].map((h) => (
      <th key={h} className="text-left px-3 md:px-4 py-3 font-bold tracking-widest uppercase whitespace-nowrap">
        {h}
      </th>
    ))}
  </tr>
</thead>
                            <tbody>
                                {paginated.map((bill) => (
                                    <tr
                                        key={bill._id}
                                        className="border-b border-neutral-200 last:border-0 hover:bg-neutral-50"
                                    >
                                        <td className="sticky left-0 z-10 bg-white px-3 md:px-4 py-3 font-bold border-r border-neutral-100">
  {bill.billNo}
</td>
                                        <td className="px-3 md:px-4 py-3">{bill.vehicleNo || "—"}</td>
                                        <td className="px-3 md:px-4 py-3 text-neutral-500">{bill.shop?.title ?? "—"}</td>
                                        <td className="px-3 md:px-4 py-3 text-neutral-500 whitespace-nowrap">
                                            {toDisplayDateTime(bill.printDate)}
                                        </td>
                                        <td className="px-3 md:px-4 py-3">{bill.netWeight}</td>
                                        <td className="px-3 md:px-4 py-3">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <button
                                                    onClick={() => openEdit(bill)}
                                                    className="border border-black p-1 hover:bg-black hover:text-white"
                                                    title="Edit"
                                                >
                                                    <Pencil size={11} />
                                                </button>
                                                <button
                                                    onClick={() => setExportTarget(bill)}
                                                    className="border border-black p-1 hover:bg-black hover:text-white"
                                                    title="Export"
                                                >
                                                    <FileDown size={11} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteBill(bill)}
                                                    className="border border-red-600 text-red-600 p-1 hover:bg-red-600 hover:text-white"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-neutral-500 font-mono">
                            {filtered.length} bill{filtered.length !== 1 ? "s" : ""}
                            {totalPages > 1 && (
                                <>
                                    {" "}
                                    &nbsp;·&nbsp; page {page} of {totalPages}
                                </>
                            )}
                        </span>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <PaginationBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                                    <ChevronLeft size={12} />
                                </PaginationBtn>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                        if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, i) =>
                                        p === "..." ? (
                                            <span key={`ellipsis-${i}`} className="px-1 text-xs text-neutral-400">
                                                …
                                            </span>
                                        ) : (
                                            <PaginationBtn key={p} onClick={() => setPage(p as number)} active={page === p}>
                                                {p}
                                            </PaginationBtn>
                                        ),
                                    )}
                                <PaginationBtn
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight size={12} />
                                </PaginationBtn>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ── Edit Modal ── */}
            {editBill && (
                <Modal
                    title={`Edit Bill #${editBill.billNo}`}
                    onClose={() => setEditBill(null)}
                    footer={
                        <>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-black text-white text-xs px-4 py-2 tracking-widest uppercase hover:bg-neutral-800 disabled:opacity-50"
                            >
                                <Check size={12} />
                                {saving ? "Saving..." : "Save"}
                            </button>
                            <button
                                onClick={() => setEditBill(null)}
                                className="flex items-center gap-2 border border-black text-xs px-4 py-2 tracking-widest uppercase hover:bg-neutral-100"
                            >
                                <X size={12} />
                                Cancel
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4 text-xs font-mono">
                        <div>
                            <Label>Shop</Label>
                            <ShopDropdown
                                value={typeof editForm.shop === "object" ? (editForm.shop as ShopOption)._id : ""}
                                shops={shops}
                                onChange={(shop) => ef("shop", shop)}
                            />
                        </div>

                        <DottedLine />

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Vehicle No.</Label>
                                <Input
                                    value={editForm.vehicleNo ?? ""}
                                    onChange={(v) => ef("vehicleNo", v.toUpperCase())}
                                />
                            </div>
                            <div>
                                <Label>Print Date</Label>
                                <DateTimeInput
                                    value={editForm.printDate ?? nowDateTimeLocal()}
                                    onChange={(v) => ef("printDate", v)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Material</Label>
                            <Input value={editForm.material ?? ""} onChange={(v) => ef("material", v.toUpperCase())} />
                        </div>

                        <DottedLine />

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Gross (KG)</Label>
                                <Input
                                    type="number"
                                    value={String(editForm.grossWeight ?? 0)}
                                    onChange={(v) => ef("grossWeight", v)}
                                />
                            </div>
                            <div>
                                <Label>Gross Time</Label>
                                <DateTimeInput
                                    value={editForm.grossTime ?? nowDateTimeLocal()}
                                    onChange={(v) => ef("grossTime", v)}
                                />
                            </div>
                            <div>
                                <Label>Tare (KG)</Label>
                                <Input
                                    type="number"
                                    value={String(editForm.tareWeight ?? 0)}
                                    onChange={(v) => ef("tareWeight", v)}
                                />
                            </div>
                            <div>
                                <Label>Tare Time</Label>
                                <DateTimeInput
                                    value={editForm.tareTime ?? nowDateTimeLocal()}
                                    onChange={(v) => ef("tareTime", v)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Net (KG)</Label>
                            <div className="border border-black px-2 py-1 bg-neutral-50">
                                {gross - tare >= 0 ? gross - tare : 0}
                            </div>
                        </div>

                        <DottedLine />

                        <div>
                            <Label>Weighment Charges</Label>
                            <Input
                                type="number"
                                value={String(editForm.weighmentCharges ?? 0)}
                                onChange={(v) => ef("weighmentCharges", v)}
                            />
                        </div>
                    </div>
                </Modal>
            )}

            {/* ── Delete Confirm Modal ── */}
            {deleteBill && (
                <Modal
                    title="Delete Bill"
                    onClose={() => setDeleteBill(null)}
                    footer={
                        <>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex cursor-pointer items-center gap-2 bg-red-600 text-white text-xs px-4 py-2 tracking-widest uppercase hover:bg-red-700 disabled:opacity-50"
                            >
                                <Trash2 size={12} />
                                {deleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                            <button
                                onClick={() => setDeleteBill(null)}
                                className="flex cursor-pointer items-center gap-2 border border-black text-xs px-4 py-2 tracking-widest uppercase hover:bg-neutral-100"
                            >
                                <X size={12} />
                                Cancel
                            </button>
                        </>
                    }
                >
                    <p className="text-xs font-mono text-neutral-700 leading-relaxed">
                        Are you sure you want to delete <span className="font-bold">Bill #{deleteBill.billNo}</span>
                        {deleteBill.vehicleNo ? <> — {deleteBill.vehicleNo}</> : null}? This action cannot be undone.
                    </p>
                </Modal>
            )}

            {/* ── Export Modal (shared) ── */}
            <ExportModal
                bill={exportTarget as unknown as IBill}
                shop={exportTarget?.shop ?? null}
                onClose={() => setExportTarget(null)}
            />
        </div>
    );
}

/* ── Shared small components ── */

function Modal({
    title,
    onClose,
    footer,
    children,
}: {
    title: string;
    onClose: () => void;
    footer: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white border border-black w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-black px-5 py-4 shrink-0">
                    <h3 className="text-xs font-bold tracking-widest uppercase">{title}</h3>
                    <button onClick={onClose} className="hover:opacity-60 cursor-pointer">
                        <X size={16} />
                    </button>
                </div>
                <div className="px-5 py-5 overflow-y-auto flex-1">{children}</div>
                <div className="flex gap-3 border-t border-black px-5 py-4 shrink-0">{footer}</div>
            </div>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="block font-bold tracking-widest uppercase mb-1 text-[10px]">{children}</label>;
}

function Input({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-black px-2 py-1 focus:outline-none"
        />
    );
}

function DottedLine() {
    return <div style={{ borderTop: "1.5px dotted #d4d4d4" }} />;
}

function PaginationBtn({
    children,
    onClick,
    disabled,
    active,
}: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`min-w-[26px] cursor-pointer h-[26px] flex items-center justify-center text-xs border font-mono ${active ? "bg-black text-white border-black" : "border-black hover:bg-neutral-100"} disabled:opacity-30 disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    );
}
