"use client"; // Make sure this component is rendered on the client side

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation for client-side routing in Next.js 13+
import bcrypt from "bcryptjs";
import { supabase } from "../lib/supabaseClient"; // Ensure you have Supabase initialized correctly
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // For displaying success message
  const [isClient, setIsClient] = useState(false); // To track if we are on the client side
  const router = useRouter(); // Initialize useRouter for redirection

  useEffect(() => {
    // Set isClient to true when the component is mounted on the client
    setIsClient(true);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const response = await register({ name, email, password });

    if (response.error) {
      setError(response.error);
      setSuccessMessage(""); // Clear success message if registration fails
    } else {
      // Set the success message to inform the user of successful registration
      setSuccessMessage("Registration Successful! Redirecting to login...");

      // Redirect after 3 seconds
      setTimeout(() => {
        if (isClient) {
          router.push("/login"); // Redirect to login after the success message
        }
      }, 3000); // 3-second delay before redirect
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-[900px] flex flex-col md:flex-row">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Create Your Account
          </h1>

          {/* Error Display */}
          {error && (
            <p className="text-red-500 text-center mb-4 bg-red-100 border border-red-300 py-2 px-4 rounded-md">
              {error}
            </p>
          )}

          {/* Success Message */}
          {successMessage && (
            <p className="text-green-500 text-center mb-4 bg-green-100 border border-green-300 py-2 px-4 rounded-md">
              {successMessage}
            </p>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            {/* Password Field */}
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
                placeholder="Create a password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>

          {/* OAuth Buttons */}
          <div className="flex flex-col space-y-4 mt-6">
            <button
              onClick={() => handleOAuth("google")}
              className="flex items-center justify-center w-full py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none transition"
            >
              Log in with Google
            </button>
            <button
              onClick={() => handleOAuth("facebook")}
              className="flex items-center justify-center w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none transition"
            >
              Log in with Facebook
            </button>
          </div>

          {/* Already have an account? */}
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* Illustration Section */}
        <div className="hidden md:flex items-center justify-center md:ml-4 mt-6 md:mt-0">
          <img
            src="./auth/image.png"
            alt="Register Illustration"
            className="w-48 md:w-56 lg:w-104"
          />
        </div>
      </div>
    </div>
  );
}

// Registration logic
export async function register({ name, email, password }) {
  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if email already exists
    const { data: existingUser, error: emailError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (emailError) throw emailError;
    if (existingUser.length > 0) {
      return { error: "Email already exists. Please use a different email." };
    }

    // Insert new user into database
    const { error } = await supabase.from("users").insert([
      {
        user_name: name,
        email,
        password: hashedPassword,
        role: "User",
        status: true,
      },
    ]);

    if (error) throw error;

    const newUser = {
      user_name: name,
      email,
      role: "User",
    };

    return {
      success: true,
      user: newUser,
      message: "Registration successful!",
    };
  } catch (error) {
    console.error("❌ Registration error:", error);
    return { error: "Registration failed. Please try again." };
  }
}
