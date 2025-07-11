"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import DeleteUserModal from "@/app/components/DeleteUserModal";
import EditUserModal from "@/app/components/EditUserModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Crown,
  UserIcon,
  Calendar,
  Mail,
  Shield,
} from "lucide-react";
import Image from "next/image";

type User = {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  created_at: string;
  image_url?: string; // Optional field for user avatar
  status?: string; // Optional field for user status
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const filterUsers = useCallback(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(
        (user) => user.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const STORAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/image-user`;

      const transformedData = data.map((user) => ({
        ...user,
        image_url: user.image_url
          ? `${STORAGE_URL}/${user.image_url}`
          : "/default-avatar.png",
      }));

      setUsers(transformedData as User[]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error fetching users: ${err.message}`);
      } else {
        setError("An unknown error occurred while fetching users.");
      }
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user_id: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("user_id", user_id);
      if (error) throw error;

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.user_id !== user_id)
      );
      setIsDeleteModalOpen(false);
      setSuccessMessage("User deleted successfully!");
    } catch (err: unknown) {
      console.error("Error deleting user:", err);
      if (err instanceof Error) {
        setError(`Error deleting user: ${err.message}`);
      } else {
        setError("An unknown error occurred while deleting the user.");
      }
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedUser: User) => {
    try {
      const validRoles = ["Admin", "User"];
      const role = validRoles.includes(updatedUser.role)
        ? updatedUser.role
        : "User";

      const { error } = await supabase
        .from("users")
        .update({
          user_name: updatedUser.user_name.trim(),
          email: updatedUser.email.trim(),
          role,
        })
        .eq("user_id", updatedUser.user_id);

      if (error) throw error;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === updatedUser.user_id
            ? { ...user, ...updatedUser }
            : user
        )
      );
      setIsEditModalOpen(false);
      setSuccessMessage("User updated successfully!");
    } catch (err: unknown) {
      console.error("Unexpected error updating user:", err);
      if (err instanceof Error) {
        setError(`Error updating user: ${err.message}`);
      } else {
        setError("An unknown error occurred while updating the user.");
      }
    }
  };

  const getRoleIcon = (role: string) => {
    return role.toLowerCase() === "admin" ? (
      <Crown className="w-4 h-4" />
    ) : (
      <UserIcon className="w-4 h-4" />
    );
  };

  const getRoleBadgeColor = (role: string) => {
    return role.toLowerCase() === "admin"
      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  const totalUsers = users.length;
  const adminUsers = users.filter(
    (user) => user.role.toLowerCase() === "admin"
  ).length;
  const regularUsers = users.filter(
    (user) => user.role.toLowerCase() === "user"
  ).length;

  return (
    <motion.div
      className="container mx-auto p-4 md:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className="mb-8" variants={cardVariants}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and monitor all users in your system
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
            variants={statsVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalUsers}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
            variants={statsVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Administrators
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {adminUsers}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
            variants={statsVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Regular Users
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {regularUsers}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100 dark:border-gray-700 mb-8"
        variants={cardVariants}
      >
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer text-sm"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="fixed top-6 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-2xl z-50 flex items-center max-w-md"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
            <span className="font-medium">{successMessage}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="fixed top-6 right-6 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-2xl z-50 flex items-center max-w-md"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        variants={cardVariants}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Role
                  </th>
                  {/* Responsive: Hide on small screens */}
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:hidden">
                    Created
                  </th>
                  {/* Responsive: Hide on small screens */}
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:hidden">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                <AnimatePresence>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.user_id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        {/* Sequential ID */}
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-semibold">
                          {index + 1}
                        </td>

                        {/* User Info: avatar + name + email */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 relative rounded-full overflow-hidden shadow-md">
                              <Image
                                src={user.image_url || "/default-avatar.png"}
                                alt={`${user.user_name}'s avatar`}
                                fill
                                style={{ objectFit: "cover" }}
                                className="rounded-full"
                              />
                            </div>
                            <div>
                              <div className="text-base font-semibold text-gray-900 dark:text-white">
                                {user.user_name}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <Mail className="w-3 h-3 mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shadow-lg ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {getRoleIcon(user.role)}
                            <span className="ml-1 capitalize">{user.role}</span>
                          </span>
                        </td>

                        {/* Created Date (Conditionally Hidden) */}
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs sm:hidden">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(user.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </td>

                        {/* Status (Conditionally Hidden) */}
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs sm:hidden">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 shadow-lg">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {user.status || "Active"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end space-x-1">
                            <motion.button
                              onClick={() => handleEdit(user)}
                              className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              aria-label="Edit"
                            >
                              <Edit className="w-3 h-3" />
                            </motion.button>
                            <motion.button
                              onClick={() => {
                                setDeleteUserId(user.user_id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              aria-label="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No users found
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm || roleFilter !== "all"
                              ? "Try adjusting your search or filter criteria."
                              : "Get started by adding your first user."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      {isEditModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {isDeleteModalOpen && deleteUserId && (
        <DeleteUserModal
          userId={deleteUserId}
          onDelete={handleDelete}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default UserManagement;