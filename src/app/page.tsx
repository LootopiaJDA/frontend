import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">

      <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-700 mb-4 text-center">
        Lootopia
      </h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/ar"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition"
        >
          Test AR
          <ArrowRight size={20} />
        </Link>

        <Link
          href="/hunts"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-blue-50 transition"
        >
          Explorer les chasses
          <ArrowRight size={20} />
        </Link>
      </div>
    </main>
  );
}
