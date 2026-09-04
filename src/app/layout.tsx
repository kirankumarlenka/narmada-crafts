import "./globals.css"; import Providers from "../components/Providers";
import { Analytics } from "@vercel/analytics/next"
import Navbar from "../components/Navbar"; export const metadata = { title: "Narmada-Crafts" }; export default function RootLayout({ children }: { children: React.ReactNode }) { return (<html lang="en"><body className="bg-amber-50/40 text-stone-800 min-h-screen flex flex-col"><Providers><Navbar /><main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">{children}</main></Providers></body></html>); }
