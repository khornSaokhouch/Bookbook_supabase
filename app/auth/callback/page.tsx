"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hashString = window.location.hash.substring(1);
    console.log("[AuthCallback] URL hash:", hashString);

    if (!hashString) {
      console.error("[AuthCallback] No hash in URL");
      router.replace("/");
      return;
    }

    const hashParams = new URLSearchParams(hashString);
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    console.log("[AuthCallback] Access token:", accessToken);
    console.log("[AuthCallback] Refresh token:", refreshToken);

    if (!accessToken || !refreshToken) {
      console.error("[AuthCallback] Missing access_token or refresh_token");
      router.replace("/");
      return;
    }

    (async () => {
      try {
        // Set session with tokens
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) {
          console.error("[AuthCallback] Session set error:", sessionError.message);
          throw new Error(sessionError.message);
        }
        console.log("[AuthCallback] Session set successfully");

        // Get authenticated user info
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          console.error("[AuthCallback] User fetch error:", userError?.message);
          throw new Error("User not found");
        }
        console.log("[AuthCallback] User data:", userData.user);

        const user = userData.user;
        const userId = user.id;

        // Fetch user role from DB
        const { data: userMetadata, error: fetchError } = await supabase
          .from("users")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        if (fetchError) {
          console.error("[AuthCallback] Fetch user role error:", fetchError.message);
          throw new Error(fetchError.message);
        }

        console.log("[AuthCallback] userMetadata:", userMetadata);

        const role = userMetadata?.role ?? "User";

        console.log(`[AuthCallback] Role is: ${role}`);

        if (role === "Admin") {
          console.log("[AuthCallback] Redirecting to Admin dashboard");
          router.replace(`/admin/${userId}/dashboard`);
        } else {
          console.log("[AuthCallback] Redirecting to home page");
          router.replace("/");
        }
      } catch (error) {
        console.error("[AuthCallback] Caught error:", error);
        router.replace("/");
      }
    })();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        <span className="text-lg text-gray-700">Processing login...</span>
      </div>
    </div>
  );
}
