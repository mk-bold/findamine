"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user: { id: string; display_name: string | null; role: string; avatar_url: string | null } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

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
        ...(["teacher", "game_master", "admin", "researcher"].includes(user.role)
          ? [{ href: "/dashboard/hunts/new", label: "Create Hunt" }]
          : []),
        ...(["admin", "researcher"].includes(user.role)
          ? [{ href: "/admin", label: "Admin" }]
          : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-14">
        <Link href={user ? "/dashboard" : "/"}>
          <Image src="/logo-findamine.png" alt="findamine" width={120} height={30} className="h-7 w-auto" />
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${
                pathname.startsWith(link.href)
                  ? "text-sky-700 font-medium"
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
              <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">
                {user.display_name || "Profile"}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
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
        </div>
      </div>
    </header>
  );
}
