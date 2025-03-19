"use client";

import { useState } from "react";
import UserLayout from "../../../components/UserLayout"; // Import UserLayout
import { createClient } from "@supabase/supabase-js";

// Create a Supabase client instance (adjust this to your project configuration)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // Make sure to set these in your environment variables
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// The resetPassword function integrated directly in the component file
const resetPassword = async (email: string) => {
  try {
    // Use resetPasswordForEmail from supabase.auth to send reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true }; // Return success if reset was successful
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Input validations
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsResetting(true);
      // Send reset password request
      const result = await resetPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while resetting the password.");
      console.error(error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <UserLayout>
      <div className="container mx-auto px-10 py-10">
        <h1 className="text-3xl font-bold mb-6 ml-[100px]">Reset Password</h1>
        <div className="flex justify-center space-x-8">
          {/* Reset Password Form */}
          <div className="w-3/4 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Reset Your Password</h2>
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <div className="bg-red-100 text-red-600 p-4 rounded-md">
                  <p>{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-100 text-green-600 p-4 rounded-md">
                  <p>Password reset email sent! Please check your email inbox.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Button aligned to the right */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isResetting}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
                >
                  {isResetting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
