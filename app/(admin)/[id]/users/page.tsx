"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import DeleteUserModal from "../../../components/DeleteUserModal";
import EditUserModal from "../../../components/EditUserModal";
import { motion } from "framer-motion";
import { Edit, Trash2, CheckCircle, AlertTriangle } from "lucide-react";

type User = {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  created_at: string;
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data as User[]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error fetching users: ${err.message}`);
      } else {
        setError("An unknown error occurred while fetching users.");
      }
    }
  };

  const handleDelete = async (user_id: string) => {
    try {
      const { error } = await supabase.from("users").delete().eq("user_id", user_id);
      if (error) throw error;

      setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== user_id));
      setIsDeleteModalOpen(false);
      setSuccessMessage("User deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000); // Hide success message after 3 seconds
    } catch (err: unknown) {
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

  const handleSave = async (updatedUser: User): Promise<void> => {
    try {
      const validRoles = ["Admin", "User"];
      const role = validRoles.includes(updatedUser.role) ? updatedUser.role : "User";

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
        prevUsers.map((user) => (user.user_id === updatedUser.user_id ? { ...user, ...updatedUser } : user))
      );
      setIsEditModalOpen(false);
      setSuccessMessage("User updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000); // Hide success message after 3 seconds
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error updating user: ${err.message}`);
      } else {
        setError("An unknown error occurred while updating the user.");
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteUserId(null);
    setIsDeleteModalOpen(false);
  };

  return (
    <motion.div
      className="container mx-auto p-4 md:p-8"
      variants={{ visible: { opacity: 1, transition: { duration: 0.5 } }, hidden: { opacity: 0 } }}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 md:p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-white">Users</h1>

        {/* Success and Error Messages */}
        {successMessage && (
          <motion.div
            className="fixed top-4 right-4 bg-green-100 border border-green-500 text-green-700 py-3 px-4 rounded-md shadow-md z-50 flex items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, x: 20, transition: { duration: 0.3 } }}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </motion.div>
        )}
        {error && (
          <motion.div
            className="fixed top-4 right-4 bg-red-100 border border-red-500 text-red-700 py-3 px-4 rounded-md shadow-md z-50 flex items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, x: 20, transition: { duration: 0.3 } }}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </motion.div>
        )}

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          </div>
        ) : (
          <motion.div className="overflow-x-auto mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left text-black">ID</th>
                  <th className="py-3 px-6 text-left text-black">Name</th>
                  <th className="py-3 px-6 text-left text-black">Email</th>
                  <th className="py-3 px-6 text-left text-black">Role</th>
                  <th className="py-3 px-6 text-left text-black">Date Created</th>
                  <th className="py-3 px-6 text-left text-black">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-gray-400 text-sm font-light">
                {users.length > 0 ? (
                  users.map((user) => (
                    <motion.tr
                      key={user.user_id}
                      className="border-b dark:border-gray-700 hover:bg-gray-500 hover:text-black transition-colors duration-200 text-black"
                      variants={{ visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 10 } }}
                    >
                      <td className="py-3 px-6">{user.user_id}</td>
                      <td className="py-3 px-6">{user.user_name}</td>
                      <td className="py-3 px-6">{user.email}</td>
                      <td className="py-3 px-6 capitalize">{user.role}</td>
                      <td className="py-3 px-6">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(user)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 inline-flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleteUserId(user.user_id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500 dark:text-gray-300">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}

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
            onClose={handleCloseDeleteModal}
          />
        )}
      </div>
    </motion.div>
  );
};

export default UserManagement;