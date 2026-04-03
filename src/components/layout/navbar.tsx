"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useState } from "react";
import NotificationBell from "./notification-bell";

interface NavbarProps {
  user: { id: string; display_name: string | null; role: string; avatar_url: string | null } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navLinks = user
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/browse", label: "Browse Hunts" },
        ...(["teacher", "hunt_creator", "admin", "researcher"].includes(user.role)
          ? [
              { href: "/dashboard/hunts/new", label: "Create Hunt" },
              { href: "/dashboard/rosters", label: "Rosters" },
            ]
          : []),
        ...(["admin", "researcher"].includes(user.role)
          ? [{ href: "/admin", label: "Admin" }]
          : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-10">
        <Link href={user ? "/dashboard" : "/"}>
          <Image src="/logo-findamine.png" alt="findamine" width={120} height={25} className="max-h-[28px] w-auto" style={{ objectFit: "contain", height: "28px" }} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${
                pathname.startsWith(link.href)
                  ? "text-themed-primary font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <Link href="/settings" className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900">
                {user.display_name || "Profile"}
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:inline text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Sign up
              </Link>
            </>
          )}

          {/* Mobile hamburger — only when logged in */}
          {user && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="Navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && user && (
        <nav className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm ${
                pathname.startsWith(link.href)
                  ? "text-themed-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <hr className="my-2 border-gray-100" />
          <Link
            href="/settings"
            onClick={() => setMenuOpen(false)}
            className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {user.display_name || "Profile"}
          </Link>
          <button
            onClick={() => { setMenuOpen(false); handleLogout(); }}
            className="block w-full text-left rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
          >
            Sign out
          </button>
        </nav>
      )}
    </header>
  );
}
