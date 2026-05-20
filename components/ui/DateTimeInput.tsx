export default function DateTimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="w-full overflow-hidden border border-black">
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 px-3 py-2 text-sm lg:text-[15px] font-mono border-none outline-none bg-white"
      />
    </div>
  );
}