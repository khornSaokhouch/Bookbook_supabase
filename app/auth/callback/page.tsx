"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hashString = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hashString);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      // ✅ Clean up tokens from the URL for security
      window.history.replaceState(null, "", window.location.pathname);

      if (accessToken && refreshToken) {
        (async () => {
          try {
            // 1. Set Supabase session
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) throw new Error(sessionError.message);

            // 2. Get authenticated user
            const { data: userData, error: userError } =
              await supabase.auth.getUser();
            if (userError || !userData?.user)
              throw new Error("User not found.");

            const user = userData.user;
            const userId = user.id;

            // 3. Check if user exists in DB
            const { data: userMetadata, error: roleError } = await supabase
              .from("users")
              .select("role")
              .eq("user_id", userId)
              .maybeSingle();

            if (roleError) {
              console.error("Error fetching user role:", roleError.message);
            }

            let role = userMetadata?.role;

            // 4. If user not in DB, insert default info
            if (!userMetadata) {
              const fullName = user.user_metadata?.full_name || "User";
              const email = user.email || "";

              let image_url = null;
              if (user.user_metadata?.avatar_url) {
                const filePath = `user-images/${userId}.jpg`;

                const { data: signedUrlData, error: signedUrlError } =
                  await supabase.storage
                    .from("image-user")
                    .createSignedUrl(filePath, 60);

                if (!signedUrlError && signedUrlData?.signedUrl) {
                  image_url = signedUrlData.signedUrl;
                } else {
                  console.warn(
                    "No avatar image or error generating signed URL:",
                    signedUrlError?.message
                  );
                }
              }

              const { error: insertError } = await supabase
                .from("users")
                .insert([
                  {
                    user_id: userId,
                    user_name: fullName,
                    email,
                    image_url,
                    role: "User",
                  },
                ]);

              if (insertError) {
                console.error("Error inserting new user:", insertError.message);
                router.replace("/");
                return;
              }

              role = "User";
            }

            // 5. Redirect based on role
            router.replace(
              role === "Admin" ? `/admin/${userId}/dashboard` : "/"
            );
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            console.error("Authentication error:", errorMessage);
            router.replace("/");
          }
        })();
      } else {
        console.error("Missing access or refresh token.");
        router.replace("/");
      }
    }
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
