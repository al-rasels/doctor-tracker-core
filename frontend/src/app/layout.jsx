import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Doctor Tracker — Healthcare Management Platform",
  description: "Modern administrative portal to manage attending doctors and admitted patients with analytics."
};

/**
 * Root Application Layout wrapping all routes in AuthProvider.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
