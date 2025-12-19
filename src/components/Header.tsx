import Link from "next/link";

export default function Header() {
    return (
        <header className="w-full border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold">
                    🏴‍☠️ Lootopia
                </Link>

                <nav className="flex gap-4 text-sm">
                    <Link href="/login" className="hover:underline">
                        Connexion
                    </Link>
                    <Link
                        href="/register"
                        className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
                    >
                        Inscription
                    </Link>
                </nav>
            </div>
        </header>
    );
}
