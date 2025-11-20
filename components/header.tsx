import Link from "next/link";

export function Header() {
  return (
    <header className="w-full h-8 flex items-center px-6 py-8">
      <Link href="/">
        <h1 className="font-[family-name:var(--font-kode-mono)] text-foreground text-s font-medium cursor-pointer hover:opacity-80 transition-opacity">
          Advent Calendar
        </h1>
      </Link>
    </header>
  );
}
