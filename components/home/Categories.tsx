import Link from "next/link";

const categories = [
  { name: "Cycles", emoji: "\u{1F6B2}", slug: "cycles" },
  { name: "Electronics", emoji: "\u{1F4BB}", slug: "electronics" },
  { name: "Books", emoji: "\u{1F4DA}", slug: "books" },
  { name: "Calculators", emoji: "\u{1F9EE}", slug: "calculators" },
  { name: "Sports", emoji: "\u{1F3F8}", slug: "sports" },
  { name: "Lab gear", emoji: "\u{1F97C}", slug: "lab-gear" },
];

export default function Categories() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl font-bold">Browse by category</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/items?category=${category.slug}`}
            className="flex flex-col items-center rounded-lg border border-gray-200 p-4 hover:border-emerald-500"
          >
            <span className="text-3xl">{category.emoji}</span>
            <span className="mt-2 text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}