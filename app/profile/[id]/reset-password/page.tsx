"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Key,
  Mail,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const floatingVariants = {
  animate: {
    y: [-5, 5, -5],
    rotate: [-1, 1, -1],
    transition: {
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
  
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
  
      if (error || !user) throw error || new Error("User not found");
  
      setEmail(user.email ?? "");  // Use nullish coalescing
  
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }
  
  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword === oldPassword) {
      setError("New password must be different from the old password.");
      return;
    }

    setError("");
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
  };

  const handlePasswordReset = async () => {
    setIsConfirmOpen(false);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: oldPassword,
      });

      if (signInError) {
        setError("Invalid email or old password.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(
          updateError.message || "Failed to update password. Try again."
        );
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6)
      return { strength: 1, label: "Weak", color: "text-red-500" };
    if (password.length < 8)
      return { strength: 2, label: "Fair", color: "text-yellow-500" };
    if (password.length < 12)
      return { strength: 3, label: "Good", color: "text-blue-500" };
    return { strength: 4, label: "Strong", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-violet-900/20 dark:to-gray-800 py-8 px-4 sm:px-6 flex items-center justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[15%] left-[10%] w-32 h-32 bg-violet-200/30 dark:bg-violet-700/10 rounded-full blur-2xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-[20%] right-[15%] w-40 h-40 bg-pink-200/30 dark:bg-pink-700/10 rounded-full blur-2xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        />
        <motion.div
          className="absolute top-[60%] left-[5%] w-24 h-24 bg-indigo-200/30 dark:bg-indigo-700/10 rounded-full blur-2xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2 }}
        />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-1.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-violet-200 dark:border-violet-700 mb-4 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 text-sm"
          >
            <ArrowLeft className="h-3 w-3 mr-1.5" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Back
            </span>
          </button>

          <div className="inline-flex items-center px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-violet-200 dark:border-violet-700 mb-4">
            <Shield className="h-4 w-4 text-violet-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Security
            </span>
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Change Password 🔐
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Keep your account secure with a strong password
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
          variants={itemVariants}
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-violet-500 to-indigo-500 p-6 text-white">
            <div className="flex items-center justify-center">
              <div className="bg-white/20 p-3 rounded-full mr-3">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Update Password</h2>
                <p className="text-white/80 text-sm">
                  Enter your current and new password
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 w-auto">
            {/* Success/Error Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-4 max-w-lg bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                    <span className="text-red-800 dark:text-red-300 font-medium">
                      {error}
                    </span>
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div
                  className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <span className="text-green-800 dark:text-green-300 font-medium">
                        Password updated successfully!
                      </span>
                      <p className="text-green-700 dark:text-green-400 text-sm mt-1">
                        Redirecting to login...
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* START: UI CHANGE */}
            <form onSubmit={handleOpenConfirm}>
              {/* This div creates the two-column layout on medium screens and up */}
              <div className="flex flex-col md:flex-row md:gap-6 ">
                {/* Left Column */}
                <div className="flex-1 space-y-6 ">
                  {/* Email Field */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full pl-10 pr-12 py-3 bg-gray-200 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none   transition-all duration-200 cursor-not-allowed text-gray-500"
                      />
                    </div>
                  </motion.div>

                  {/* Old Password Field */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showOldPassword ? "text" : "password"}
                        className="w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column */}
                <div className="flex-1 space-y-6 mt-6 md:mt-0">
                  {/* New Password Field */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className="w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <motion.div
                        className="mt-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                passwordStrength.strength === 1
                                  ? "bg-red-500 w-1/4"
                                  : passwordStrength.strength === 2
                                  ? "bg-yellow-500 w-2/4"
                                  : passwordStrength.strength === 3
                                  ? "bg-blue-500 w-3/4"
                                  : passwordStrength.strength === 4
                                  ? "bg-green-500 w-full"
                                  : "w-0"
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium ${passwordStrength.color}`}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Confirm Password Field */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Match Indicator */}
                    {confirmPassword && (
                      <motion.div
                        className="mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center space-x-2">
                          {newPassword === confirmPassword ? (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">
                                Passwords match
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600 dark:text-red-400">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              <span className="text-xs font-medium">
                                Passwords do not match
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Submit Button - now sits below the columns */}
              <motion.button
                type="submit"
                className="w-full mt-8 bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-violet-600 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Updating Password...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Update Password
                  </div>
                )}
              </motion.button>
            </form>
            {/* END: UI CHANGE */}

            {/* Security Tips */}
            <motion.div
              className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-800"
              variants={itemVariants}
            >
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                💡 Security Tips
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li>
                  • Use at least 8 characters with mixed case, numbers, and
                  symbols
                </li>
                <li>• Avoid using personal information or common words</li>
                <li>• Do not reuse passwords from other accounts</li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🔐</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Confirm Password Change
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to change your password? You will need
                  to log in again with your new password.
                </p>
                <div className="flex space-x-3">
                  <motion.button
                    onClick={handleCloseConfirm}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handlePasswordReset}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-3 px-4 rounded-xl font-medium hover:from-violet-600 hover:to-indigo-600 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Shield className="h-4 w-4 mr-2 inline" />
                    Yes, Change Password
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
