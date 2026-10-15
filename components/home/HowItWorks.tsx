const steps = [
  {
    title: "Find or request",
    text: "Browse items near you and send a request with your price per hour.",
  },
  {
    title: "Agree on a price",
    text: "Negotiate with the owner until one of you accepts an offer.",
  },
  {
    title: "Pick up and return",
    text: "Photos at handover and return protect both sides, and deposits are settled fairly.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}