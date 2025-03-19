"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Fetch the user from the database
      const { data, error } = await supabase
        .from("users")
        .select("*, role") // Changed select query to include role
        .eq("email", email)
        .single();

      if (error || !data) {
        throw new Error("User not found.");
      }

      // Password validation - replace with your hashing logic
      // Assuming you have a function 'comparePasswords' that compares the entered password with the stored hash
      // const passwordMatch = await comparePasswords(password, data.hashed_password);
      const passwordMatch = true; //This code will be removed

      if (!passwordMatch) {
        throw new Error("Invalid password.");
      }

      // On successful login, redirect the user based on their role
      router.push(data.role === "Admin" ? "/admin/`${data.id}`/dashboard" : "user/`${data.id}`/profile");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-[900px] flex flex-col md:flex-row">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Welcome Back</h1>

          {error && (
            <p className="text-red-500 text-center mb-4 bg-red-100 border border-red-300 py-2 px-4 rounded-md">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Username or Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your username or email"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>

            <div className="flex justify-between mt-4">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-blue-500 hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>

          <div className="flex flex-col space-y-4 mt-6">
            <button className="flex items-center justify-center w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none transition">
              <img src="./auth/path_to_facebook_icon.png" alt="Facebook" className="w-5 h-5 mr-2" />
              Log in with Facebook
            </button>
            <button className="flex items-center justify-center w-full py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none transition">
              <img src="./auth/path_to_google_icon.png" alt="Google" className="w-5 h-5 mr-2" />
              Log in with Google
            </button>
          </div>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="hidden md:flex items-center justify-center md:ml-4 mt-6 md:mt-0">
          <img src="./auth/image.png" alt="Login Illustration" className="w-48 md:w-56 lg:w-104" />
        </div>
      </div>
    </div>
  );
}
