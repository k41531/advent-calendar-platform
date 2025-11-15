interface CalendarCellProps {
  day: number;
}

export function CalendarCell({ day }: CalendarCellProps) {
  return (
    <div className="aspect-square w-full flex items-start justify-start border-2 border-dotted border-primary bg-background rounded-lg cursor-pointer shadow-sm hover:shadow-md p-3">
      <span className="font-[family-name:var(--font-kode-mono)] text-2xl">{day}</span>
    </div>
  );
}
