import Footer from "./components/Footer";
import Header from "./components/Header";
import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto pt-15">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
