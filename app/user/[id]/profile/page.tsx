"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import ProfileImageModal from '../../../components/ProfileImageModal'; // Ensure this component exists

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null); // To store the userId
  const [loading, setLoading] = useState(true);

  // Fetch the user session on page load
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setError("Auth session missing!");
        setLoading(false);
      } else if (session) {
        setUserId(session.user.id); // Get userId from session
      }
    };

    // Check the session when component mounts
    fetchSession();

    // Listen for auth state changes (no cleanup needed)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUserId(session.user.id);
      } else {
        setError("You must be logged in to view this page.");
      }
      setLoading(false);
    });

  }, []);

  // Fetch user data when userId is available
  useEffect(() => {
    if (!userId) return; // Do not fetch if userId is not yet available

    const fetchUserData = async () => {
      setLoading(true); // Start loading
      const { data, error: fetchError } = await supabase
        .from('users') // Make sure 'users' is the correct table
        .select('*, user_id, user_name, email, about_me, image_url') // Adjust the fields as needed
        .eq('user_id', userId) // Fetch the user data by user_id
        .single(); // Ensure only a single result is returned

      if (fetchError) {
        setError(fetchError.message); // Set error if fetch fails
      } else {
        setUser(data); // Set the user data
      }
      setLoading(false); // End loading
    };

    fetchUserData();
  }, [userId]); // Re-run if userId changes

  if (loading) {
    return <div>Loading...</div>; // Show loading state while fetching data
  }

  if (error) {
    return <div className="text-red-500">{error}</div>; // Show error message if any error occurs
  }

  return (
    <div className="container mx-auto px-10 py-10">
      <h1 className="text-3xl font-bold mb-6 ml-[100px]">My Profile</h1>
      <div className="flex justify-center space-x-8">
        {/* Profile Information */}
        <div className="w-3/4 bg-white rounded-lg shadow-lg flex flex-col p-6">
          {user ? (
            <>
              {/* Profile details */}
              <div className="flex items-center">
                <ProfileImageModal imageUrl={user.image_url} /> {/* Profile Image Modal */}
                <div className="ml-4">
                  <h1 className="text-2xl font-bold">{user.user_name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              {/* About Me Section */}
              <h2 className="text-2xl font-semibold mt-6">About Me</h2>
              <p className="mt-2">{user.about_me || "No information available."}</p>
            </>
          ) : (
            <p className="text-gray-700">No user data found.</p> // Fallback message if user data is missing
          )}
        </div>
      </div>
    </div>
  );
}
