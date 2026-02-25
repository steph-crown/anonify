export function MaskToken({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline rounded-sm bg-green-100 px-1 py-0.5 font-mono text-[0.8em] font-semibold text-green-800">
      [{children}]
    </span>
  );
}
