"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Lock } from "lucide-react";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // Confirm popup state
  const router = useRouter();

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
    setError("");
    setIsConfirmOpen(true); // Show confirm popup
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
  };

  const handlePasswordReset = async () => {
    setIsConfirmOpen(false); // close confirm popup
    setLoading(true);

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
      setError(updateError.message || "Failed to update password. Try again.");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    }

    setLoading(false);
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center dark:bg-gray-900"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="w-full max-w-3xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border dark:border-gray-700"
        variants={itemVariants}
      >
        <div className="flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-gray-500 dark:text-gray-400 mr-2" />
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Change Password
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
          Enter your details to update your password.
        </p>

        <form onSubmit={handleOpenConfirm} className="mt-6 space-y-4">
          {error && (
            <div className="bg-red-100 dark:bg-red-700 text-red-600 dark:text-red-200 p-3 rounded-md text-center flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 dark:bg-green-700 text-green-600 dark:text-green-200 p-3 rounded-md text-center flex items-center justify-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Password updated! Redirecting...
            </div>
          )}

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Old Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              New Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </motion.div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 rounded-md transition flex justify-center items-center"
            disabled={loading} // Disable the button while loading
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-200"></div>
                <span className="ml-2">Updating...</span>
              </div>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </motion.div>

      {/* Confirmation Popup */}
      {isConfirmOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-50"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border dark:border-gray-700"
            variants={itemVariants}
          >
            <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
              Are you sure you want to change your password?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handlePasswordReset}
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition"
              >
                Yes, Change Password
              </button>
              <button
                onClick={handleCloseConfirm}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
