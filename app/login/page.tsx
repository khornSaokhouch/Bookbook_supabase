"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock , Eye , EyeOff , Heart, Sparkles } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false); // Toggle visibility

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
        throw new Error(
          error?.message ||
            "Oops! Something went wrong. Please check your credentials and try again."
        );
      }

      const user = data.user;
      const { data: userMetadata, error: metadataError } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (metadataError) {
        throw new Error(
          metadataError.message ||
            "We&apos;re having trouble accessing your account details."
        );
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
        role === "Admin" ? `/admin/${user.id}/dashboard` : `/`;
      router.push(redirectUrl);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(
          err.message ||
            "We couldn&apos;t sign you in right now. Please try again!"
        );
      } else {
        setErrorMessage(
          "We couldn&apos;t sign you in right now. Please try again!"
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    const redirectTo = process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL;
    console.log("Redirect URL:", redirectTo);

    if (!redirectTo) {
      console.error(
        "Missing environment variable: NEXT_PUBLIC_SUPABASE_REDIRECT_URL"
      );
      setErrorMessage("Login setup error. Please try again later.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      console.error("OAuth login error:", error.message);
      setErrorMessage(
        error.message ||
          "Google sign-in didn't work this time. Let's try again!"
      );
    }
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-lavender-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/90 p-8 md:p-10 rounded-3xl shadow-xl border border-white/20 w-full max-w-[950px] flex flex-col md:flex-row overflow-hidden"
        variants={itemVariants}
      >
        {/* Left side - Form */}
        <div className="flex-grow md:pr-8">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-full">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Welcome back!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              We&apos;re so happy to see you again! ✨
            </p>
          </motion.div>

          {errorMessage && (
            <motion.div
              variants={itemVariants}
              className="text-red-600 text-center mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 py-4 px-6 rounded-2xl"
            >
              <div className="flex items-center justify-center mb-1">
                <span className="text-lg">😔</span>
              </div>
              {errorMessage}
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={itemVariants}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 dark:text-gray-200 font-medium mb-3 text-lg"
              >
                Your Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:bg-gray-700 dark:text-white transition-all duration-200 text-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 dark:text-gray-200 font-medium mb-3 text-lg"
              >
                Your Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
                <input
                  type={showPassword ? "text" : "password"} // Show/hide logic
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:bg-gray-700 dark:text-white transition-all duration-200 text-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-500 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing you in...
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Let&apos;s go!</span>
                  <Sparkles className="ml-2 h-5 w-5" />
                </div>
              )}
            </motion.button>

            <div className="flex justify-between items-center mt-6 text-sm">
              <label className="flex items-center text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-3 rounded-lg text-purple-500 focus:ring-purple-500 focus:ring-2 w-4 h-4 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-base">Keep me signed in</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-purple-500 hover:text-purple-600 hover:underline text-base font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </motion.form>

          <motion.div className="mt-8" variants={itemVariants}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-base">
                  Or continue with
                </span>
              </div>
            </div>

            <motion.button
              onClick={handleGoogleLogin}
              className="mt-6 flex items-center justify-center w-full py-4 bg-white border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FcGoogle className="w-6 h-6 mr-3" />
              Continue with Google
            </motion.button>
          </motion.div>

          <motion.p
            className="mt-8 text-center text-gray-600 dark:text-gray-300 text-base"
            variants={itemVariants}
          >
            Do not have an account?{" "}
            <Link
              href="/register"
              className="text-purple-500 hover:text-purple-600 font-semibold hover:underline"
            >
              Register now
            </Link>
          </motion.p>
        </div>

        {/* Right side - Illustration */}
        <motion.div
          className="hidden md:flex items-center justify-center md:ml-8 mt-8 md:mt-0"
          variants={itemVariants}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-3xl transform rotate-3 opacity-20"></div>
            <Image
              src="/login.png"
              alt="Welcome back illustration"
              className="relative z-10 w-80 h-96 object-cover rounded-3xl shadow-2xl"
              width={350}
              height={400}
            />
            <div className="absolute -top-4 -right-4 bg-indigo-400 rounded-full p-3 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-purple-400 rounded-full p-3 shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
