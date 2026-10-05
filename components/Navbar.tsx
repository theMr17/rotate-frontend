import Link from "next/link";

const links = [
  { href: "/items", label: "Browse" },
  { href: "/orders", label: "My Orders" },
  { href: "/items/new", label: "List an Item" },
];

export default function Navbar() {
  return (
    <header className="border-b border-gray-200">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold">
          RentIt
        </Link>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-white">
            Log in
          </Link>
        </div>
      </nav>
    </header>
  );
}