"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import DeleteUserModal from "../../../components/DeleteUserModal";
import EditUserModal from "../../../components/EditUserModal"; // Ensure this component exists

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
    } catch (err: any) {
      setError(`Error fetching users: ${err.message}`);
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user_id: string) => {
    try {
      const { error } = await supabase.from("users").delete().eq("user_id", user_id);
      if (error) throw error;

      setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== user_id));
      setIsDeleteModalOpen(false);
      setSuccessMessage("User deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(`Error deleting user: ${err.message}`);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedUser: User) => {
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
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Unexpected error updating user:", err);
      setError(`Error updating user: ${err.message}`);
    }
  };

  return (
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-semibold mb-4">Users</h1>
        <p className="mb-4 text-gray-600">Manage users here. You can edit or remove users.</p>

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white py-2 px-4 rounded shadow-lg z-50">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && <div className="text-red-600 bg-red-100 p-4 rounded-lg mb-6">{error}</div>}

        {loading ? (
          <div className="text-center">Loading users...</div>
        ) : (
          <div className="overflow-x-auto mt-6 bg-white rounded-lg shadow">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">ID</th>
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">Role</th>
                  <th className="py-3 px-6 text-left">Date Created</th>
                  <th className="py-3 px-6 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.user_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-6">{user.user_id}</td>
                      <td className="py-3 px-6">{user.user_name}</td>
                      <td className="py-3 px-6">{user.email}</td>
                      <td className="py-3 px-6 capitalize">{user.role}</td>
                      <td className="py-3 px-6">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-6 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(user)}
                          className="mr-2 text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleteUserId(user.user_id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit User Modal */}
        {isEditModalOpen && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSave}
          />
        )}

        {/* Delete User Modal */}
        {isDeleteModalOpen && deleteUserId && (
          <DeleteUserModal
            userId={deleteUserId}
            onDelete={handleDelete}
            onClose={() => setIsDeleteModalOpen(false)}
          />
        )}
      </div>
  );
};

export default UserManagement;
