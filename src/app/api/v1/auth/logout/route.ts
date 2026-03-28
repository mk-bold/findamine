import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { errorResponse } from "@/lib/utils/api-auth";

export async function POST(request: NextRequest) {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    await supabase.auth.signOut();

    return Response.json({ message: "Logged out" });
  } catch (error) {
    return errorResponse(error);
  }
}
