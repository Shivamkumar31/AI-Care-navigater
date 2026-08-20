import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "AI Care Navigator | Precision Care Challenge 2026",
  description: "Insurance-aware hospital and treatment navigation for patients and caregivers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
