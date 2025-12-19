export default function Footer() {
    return (
        <footer className="border-t bg-white text-sm text-gray-500">
            <div className="mx-auto max-w-7xl px-4 py-4 text-center">
                © {new Date().getFullYear()} Lootopia – Projet Mastère Full Stack
            </div>
        </footer>
    );
}
