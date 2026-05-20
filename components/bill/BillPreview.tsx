import { toDisplayDateTime } from "@/lib/utils";
import { IBill } from "@/types";

interface Props {
    bill: Omit<Partial<IBill>, "shop"> & {
        shop?: {
            title: string;
            location: string;
            weight: number;
        } | null;
    };
}

export default function BillPreview({ bill }: Props) {
    const shop = bill.shop;

    const netWeight =
        bill.grossWeight != null && bill.tareWeight != null
            ? String(bill.grossWeight - bill.tareWeight).padStart(5, "0")
            : "00000";

    return (
        <div
            id="bill-preview"
            className="
        bg-white text-black font-mono border-2 border-black
        w-full max-w-[375px] lg:max-w-[420px]
        text-[11px] lg:text-[12px]
        leading-[1.65]
        px-3 py-3.5 lg:px-4 lg:py-4
      "
        >
            {/* Logo + Title */}
            <div className="text-center mb-1.5">
                <div className="text-[26px] lg:text-[30px] mb-0.5">⚖️</div>
                <div className="font-bold text-[13px] lg:text-[14px] tracking-[2px]">
                    {shop?.title?.toUpperCase() ?? "WEIGHT BRIDGE"}
                </div>
                <div className="text-[10px] lg:text-[11px] mt-0.5 leading-snug">{shop?.location ?? ""}</div>
            </div>

            <DottedLine />

            <div className="text-center font-bold tracking-[1px]">COMPUTERIZED {shop?.weight ?? 80} TONNE WEIGH BRIDGE</div>

            <DottedLine />

            {/* Bill No — inline, value right after the colon */}
            <div className="flex gap-1 items-baseline mb-0.5">
                <span className="font-bold">Bill No.</span>
                <span>: {bill.billNo ?? "—"}</span>
            </div>

            {/* Print Date — full row, no truncation */}
            <div className="flex gap-1 items-baseline mb-0.5">
                <span className="font-bold shrink-0">PRINT DATE</span>
                <span>: {bill.printDate ? toDisplayDateTime(bill.printDate) : "—"}</span>
            </div>

            {/* Vehicle No — full row */}
            <div className="flex gap-1 items-baseline mb-1">
                <span className="font-bold shrink-0">VEHICLE</span>
                <span>: {bill.vehicleNo || "—"}</span>
            </div>

            {/* Material */}
            <div className="flex gap-1 items-baseline mb-1">
                <span className="font-bold">MATERIAL</span>
                <span>: {bill.material ?? "SCRAP"}</span>
            </div>

            <DottedLine />

            {/* Gross Weight */}
            <WeightRow
                label="GROSS"
                weight={bill.grossWeight != null ? String(bill.grossWeight).padStart(5, "0") : "00000"}
                time={bill.grossTime ? toDisplayDateTime(bill.grossTime) : "—"}
            />

            {/* Tare Weight */}
            <WeightRow
                label="TARE"
                weight={bill.tareWeight != null ? String(bill.tareWeight).padStart(5, "0") : "00000"}
                time={bill.tareTime ? toDisplayDateTime(bill.tareTime) : "—"}
            />

            {/* Net Weight */}
            <div className="flex gap-1 items-baseline mb-1">
                <span className="font-bold">NET WEIGHT</span>
                <span>: {netWeight} KG</span>
            </div>

            <DottedLine />

            {/* Weighment Charges */}
            <div className="flex gap-1 items-baseline mb-0.5">
                <span className="font-bold">WEIGHMENT CHARGES</span>
                <span>: {bill.weighmentCharges ?? 0}</span>
            </div>

            {/* Operator */}
            <div className="text-right mt-3 font-bold">OPERATORS SIGN : {bill.operatorSign ?? "ADMIN"}</div>
        </div>
    );
}

/* ── helpers ── */

function DottedLine() {
    return <div className="my-1.5" style={{ borderTop: "1.5px dotted #222" }} />;
}

function WeightRow({ label, weight, time }: { label: string; weight: string; time: string }) {
    return (
        <div className="flex justify-between items-baseline gap-2 mb-0.5">
            {/* left: label + weight — never wraps */}
            <div className="flex gap-1 items-baseline whitespace-nowrap shrink-0">
                <span className="font-bold">{label} WEIGHT</span>
                <span>: {weight} KG</span>
            </div>
            {/* right: time — never wraps */}
            <div className="flex gap-1 items-baseline whitespace-nowrap shrink-0 text-[0.95em]">
                <span className="font-bold">TIME</span>
                <span>: {time}</span>
            </div>
        </div>
    );
}
