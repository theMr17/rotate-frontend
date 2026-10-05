import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-emerald-50">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Why buy it when you can <span className="text-emerald-600">rent it</span>?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Borrow cycles, laptops, calculators and more from students around you,
          or earn by renting out what you don&apos;t use.
        </p>

        <form action="/items" className="mx-auto mt-8 flex max-w-xl gap-2">
          <input
            type="search"
            name="q"
            placeholder="What do you need? e.g. cycle, calculator"
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-3 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
          >
            Search
          </button>
        </form>

        <Link
          href="/items/new"
          className="mt-6 inline-block text-sm font-medium text-emerald-700 hover:underline"
        >
          List an item and start earning
        </Link>
      </div>
    </section>
  );
}