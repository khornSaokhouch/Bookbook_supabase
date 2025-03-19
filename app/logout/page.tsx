"use client";

import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { supabase } from "../lib/supabaseClient";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Error signing out:", error);
          // Optionally display an error message to the user
        } else {
          router.push("/"); // Redirect to the home page after logout
        }
      } catch (error) {
        console.error("An error occurred during logout:", error);
        // Optionally display an error message to the user
      }
    };

    logout();
  }, [router]);

  return (
    <div>
      Logging out...
    </div>
  );
}