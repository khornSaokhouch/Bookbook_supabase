"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient"; // adjust path accordingly

export default function ProfileAdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [preview, setPreview] = useState(null);

  // Get authenticated user
  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user && !error) {
        setUser({ id: data.user.id, email: data.user.email ?? "unknown@example.com" });
      }
    }
    getUser();
  }, []);

  // Fetch profile data from 'users' table
  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("users")
          .select("user_name, about_me, image_url")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setName(data.user_name || "");
          setAboutMe(data.about_me || "");
          if (data.image_url) {
            const { data: publicData } = supabase.storage
              .from("image-user")
              .getPublicUrl(data.image_url);
            setPreview(publicData.publicUrl);
          } else {
            setPreview(null);
          }
        } else {
          console.error("Error fetching profile:", error);
          setError(`Error fetching profile: ${error.message}`);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Profile</h1>
        <p className="text-muted-foreground">Manage your profile information and settings</p>
      </div>

      {loading && <p>Loading profile...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && user && (
        <>
          <div className="flex items-center space-x-6 mb-6">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover border"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border">
                No Image
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold">{name || user.email}</h2>
            </div>
           
          </div>

          <div className="text-gray-500">{user.email}</div>

          <div>
            <h3 className="text-lg font-semibold mb-2">About Me</h3>
            <p className="text-gray-700 whitespace-pre-line">{aboutMe || "No information provided."}</p>
          </div>
        </>
      )}
    </div>
  );
}
