import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function MyHuntsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const serviceClient = await createSupabaseServiceClient();
  const { data: profile } = await serviceClient
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .single();

  if (!profile) redirect("/login");

  const { data: hunts } = await serviceClient
    .from("hunts")
    .select("id, title, status, target_audience, play_mode, created_at, finds(count)")
    .eq("created_by", profile.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">My Hunts</h1>
        <Link
          href="/dashboard/hunts/new"
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Create Hunt
        </Link>
      </div>

      {!hunts || hunts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven&apos;t created any hunts yet.</p>
          <Link
            href="/dashboard/hunts/new"
            className="text-sky-600 hover:underline"
          >
            Create your first hunt
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {hunts.map((hunt) => (
            <Link
              key={hunt.id}
              href={`/dashboard/hunts/${hunt.id}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-sky-200 transition-colors"
            >
              <div>
                <h3 className="font-medium text-gray-900">{hunt.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className={`rounded-full px-2 py-0.5 ${
                    hunt.status === "published"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {hunt.status}
                  </span>
                  <span>{hunt.target_audience}</span>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(hunt.created_at).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
