"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hashString = window.location.hash.substring(1); // Remove the '#'
      const hashParams = new URLSearchParams(hashString);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        (async () => {
          try {
            // Set session in Supabase
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) throw new Error(sessionError.message);

            // Get the authenticated user
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user) throw new Error("User not found.");

            const userId = userData.user.id;

            // Fetch user role from Supabase database
            const { data: userMetadata, error: roleError } = await supabase
              .from("users")
              .select("role")
              .eq("user_id", userId)
              .single();

            const role = userMetadata?.role || "User";

            // Redirect based on role
            router.replace(role === "Admin" ? `/admin/${userId}/dashboard` : "/");
          } catch (error) {
            console.error("Authentication error:", error);
            router.replace("/"); // Fallback to home
          }
        })();
      } else {
        console.error("Missing access or refresh token.");
        router.replace("/");
      }
    }
  }, [router]);

  return <p>Processing login...</p>;
}
