"use client";

import { useState, useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function fetchNotifications() {
    setLoading(true);
    const res = await fetch("/api/v1/notifications?limit=20");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications || []);
    }
    setLoading(false);
  }

  // Load on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time subscription for new notifications
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function handleMarkRead(id: string) {
    await fetch("/api/v1/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  async function handleMarkAllRead() {
    await fetch("/api/v1/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mark_all_read: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
        aria-label="Notifications"
      >
        {/* Bell icon */}
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
            <h4 className="text-sm font-semibold text-gray-900">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-sky-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-50 rounded animate-pulse" />)}
              </div>
            ) : notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-400">No notifications</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    !n.is_read ? "bg-sky-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm ${!n.is_read ? "font-medium text-gray-900" : "text-gray-700"}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatTimeAgo(n.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
