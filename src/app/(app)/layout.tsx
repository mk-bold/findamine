import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let profile = null;
  if (authUser) {
    const serviceClient = await createSupabaseServiceClient();
    const { data } = await serviceClient
      .from("users")
      .select("id, display_name, role, avatar_url")
      .eq("auth_id", authUser.id)
      .is("deleted_at", null)
      .single();
    profile = data;
  }

  return (
    <>
      <Navbar user={profile} />
      {children}
    </>
  );
}
