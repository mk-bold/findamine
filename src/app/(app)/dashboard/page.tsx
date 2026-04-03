import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";
import HeroBanner from "@/components/layout/hero-banner";
import { selectHeroBanner } from "@/lib/services/hero-banner";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const serviceClient = await createSupabaseServiceClient();
  const { data: profile } = await serviceClient
    .from("users")
    .select("id, email, display_name, role, avatar_url, created_at")
    .eq("auth_id", authUser.id)
    .is("deleted_at", null)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Get age band for hero selection
  let ageBand: string | null = null;
  if (profile) {
    const { data: userProfile } = await serviceClient
      .from("user_profiles")
      .select("effective_band")
      .eq("user_id", profile.id)
      .maybeSingle();
    ageBand = userProfile?.effective_band || null;
  }

  const hero = selectHeroBanner({ userRole: profile.role, ageBand });

  return (
    <>
      <div
        className="relative w-full h-16 sm:h-20 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${hero.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="relative text-white text-lg sm:text-xl font-semibold tracking-wide drop-shadow-md">
          Dashboard
        </h1>
      </div>
      <DashboardClient user={profile} />
    </>
  );
}
