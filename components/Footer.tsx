export default function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row sm:justify-between">
        <p>Copyright - {new Date().getFullYear()} RentIt - Built at IIT Bombay</p>
        <p>CS699 Software Lab Project</p>
      </div>
    </footer>
  );
}