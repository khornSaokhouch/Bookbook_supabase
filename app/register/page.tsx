"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react"; // Add Eye and EyeOff icons
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  CheckCircle,
  Heart,
  Sparkles,
  UserPlus,
  Shield,
  Gift,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";

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

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false); // toggle state

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, role: "User" },
        },
      });

      if (authError) {
        throw authError;
      }

      const { user } = data;

      if (!user) {
        throw new Error("User registration failed. Please try again.");
      }

      const { error: userError } = await supabase.from("users").insert([
        {
          user_id: user.id,
          user_name: name,
          email: user.email,
          role: "User",
          status: "Active",
          created_at: new Date(),
        },
      ]);

      if (userError) {
        throw userError;
      }

      setSuccessMessage(
        "🎉 Welcome to our community! Check your email to verify your account."
      );

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(
          error.message ||
            "Oops! Something went wrong. Let's try that again! 😊"
        );
      } else {
        setError("Something unexpected happened. Please give it another try!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  async function handleGoogleSignUp() {
    const redirectTo = process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL;

    if (!redirectTo) {
      setError("Setup error. Please try again later.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setError(
        error.message ||
          "Google sign-up didn't work this time. Let's try again!"
      );
    }
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-teal-900/20 dark:to-gray-800 p-4 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Floating background elements */}
      <motion.div
        className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full opacity-20"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full opacity-20"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-10 w-12 h-12 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 2 }}
      />

      <motion.div
        className="bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 p-8 md:p-12 rounded-3xl shadow-2xl border border-white/30 w-full max-w-[1000px] flex flex-col md:flex-row overflow-hidden relative"
        variants={itemVariants}
      >
        {/* Left side - Form */}
        <div className="flex-grow md:pr-10">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-full shadow-lg">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Join Our Community!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              We are excited to have you on board! ✨
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1 text-emerald-500" />
                <span>Secure</span>
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1 text-pink-500" />
                <span>Friendly</span>
              </div>
              <div className="flex items-center">
                <Gift className="w-4 h-4 mr-1 text-purple-500" />
                <span>Free</span>
              </div>
            </div>
          </motion.div>

          {error && (
            <motion.div
              variants={itemVariants}
              className="text-red-600 text-center mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 py-4 px-6 rounded-2xl"
            >
              <div className="flex items-center justify-center mb-1">
                <span className="text-lg">😔</span>
              </div>
              {error}
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              variants={itemVariants}
              className="text-emerald-600 text-center mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 py-4 px-6 rounded-2xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 mr-2" />
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>
              {successMessage}
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={itemVariants}
          >
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 dark:text-gray-200 font-medium mb-3 text-lg"
              >
                What should we call you?
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your awesome name"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:bg-gray-700 dark:text-white transition-all duration-200 text-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 dark:text-gray-200 font-medium mb-3 text-lg"
              >
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:bg-gray-700 dark:text-white transition-all duration-200 text-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 dark:text-gray-200 font-medium mb-3 text-lg"
              >
                Create a Secure Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Make it strong and memorable"
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:bg-gray-700 dark:text-white transition-all duration-200 text-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-emerald-500 focus:outline-none"
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
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating your account...
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Join the Community!</span>
                  <Sparkles className="ml-2 h-5 w-5" />
                </div>
              )}
            </motion.button>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                By signing up, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-emerald-500 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-emerald-500 hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </motion.form>

          <motion.div className="mt-8" variants={itemVariants}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-base">
                  Or join with
                </span>
              </div>
            </div>

            <motion.button
              onClick={handleGoogleSignUp}
              className="mt-6 flex items-center justify-center w-full py-4 bg-white border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FcGoogle className="w-6 h-6 mr-3" />
              Continue with Google
            </motion.button>

            <motion.div
              className="mt-6 text-center text-gray-600 dark:text-gray-300"
              variants={itemVariants}
            >
              <p>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-emerald-500 font-medium hover:underline hover:text-emerald-600 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Right side - Illustration */}
        <motion.div
          className="hidden md:flex items-center justify-center md:ml-10 mt-8 md:mt-0"
          variants={itemVariants}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-3xl transform rotate-3 opacity-20"></div>
            <Image
              src="/auth/image.png"
              alt="Join our community illustration"
              className="relative z-10 w-80 h-96 object-cover rounded-3xl shadow-2xl"
              width={350}
              height={400}
            />
            <div className="absolute -top-4 -right-4 bg-emerald-400 rounded-full p-3 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-teal-400 rounded-full p-3 shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="absolute top-1/2 -left-6 bg-purple-400 rounded-full p-2 shadow-lg">
              <Gift className="h-4 w-4 text-white" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
