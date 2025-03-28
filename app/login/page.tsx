"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Facebook } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data) {
        throw new Error(error?.message || "Failed to sign in. Please check your credentials.");
      }

      const user = data.user;
      const { data: userMetadata, error: metadataError } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (metadataError) {
        throw new Error(metadataError.message || "Failed to fetch user metadata.");
      }

      const role = userMetadata?.role || "User";

      document.cookie = `user=${encodeURIComponent(
        JSON.stringify({
          id: user.id,
          email: user.email,
          role: role,
        })
      )}; path=/; max-age=${30 * 24 * 60 * 60}`;

      const redirectUrl =
        role === "Admin" ? `/${user.id}/dashboard` : `/`;
      router.push(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  
    if (error) {
      setErrorMessage(error.message || "Google sign-in failed.");
    }
  }
  

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-[900px] flex flex-col md:flex-row">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Welcome Back</h1>

          {errorMessage && (
            <div className="text-red-500 text-center mb-4 bg-red-100 dark:bg-red-700 border border-red-300 dark:border-red-500 py-3 px-4 rounded-md">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Log In"}
            </button>

            <div className="flex justify-between mt-4 text-sm">
              <label className="flex items-center text-gray-600 dark:text-gray-300">
                <input type="checkbox" className="mr-2 rounded text-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-blue-500 hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>

          <div className="flex flex-col space-y-4 mt-6">
            <button className="flex items-center justify-center w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none transition">
              <Facebook className="w-5 h-5 mr-2" />
              Facebook
            </button>
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center w-full py-3 bg-white border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FcGoogle className="w-6 h-6 mr-2" />
              Sign in with Google
            </button>
          </div>

          <p className="mt-6 text-center text-gray-600 dark:text-gray-300 text-sm">
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
    </motion.div>
  );
}