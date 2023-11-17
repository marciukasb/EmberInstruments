import { Inter } from "next/font/google";
import "./globals.scss";
import Navigation from "@/app/_components/Navigation";
import Footer from "./_components/Footer";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
