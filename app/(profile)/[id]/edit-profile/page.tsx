"use client"
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";

// User type
type User = {
  id: string;
  user_name: string;
  email: string;
  about_me: string;
  image_url?: string | null;
};

const updateUser = async (userId: string, updatedUser: Partial<User>) => {
  const { error } = await supabase
    .from("users")
    .update(updatedUser)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error updating user:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, message: "Profile updated successfully" };
};

const EditProfile = ({ params }: { params: Promise<{ id: string }> }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const aboutMeRef = useRef<HTMLTextAreaElement>(null);

  // Fetch user data based on the id parameter
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Resolve the params Promise
        const resolvedParams = await params; // Await the Promise to get { id: string }
        const userId = resolvedParams.id;

        const { data, error } = await supabase
          .from("users")
          .select("user_id, user_name, email, about_me, image_url")
          .eq("user_id", userId)
          .single();

        if (error) {
          setError("Failed to load user data.");
        } else {
          const fetchedUser: User = {
            id: data.user_id,
            user_name: data.user_name,
            email: data.email,
            about_me: data.about_me,
            image_url: data.image_url || null,
          };
          setUser(fetchedUser);
        }
      } catch (error) {
        console.error("Error during fetchUserData:", error);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params]); // Dependency on params

  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const validFileTypes = ["image/jpeg", "image/png", "image/gif"];
      
      if (!validFileTypes.includes(file.type)) {
        alert("Please upload a valid image file (JPEG, PNG, GIF).");
        return;
      }

      setSelectedFile(file);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameRef.current?.value || !emailRef.current?.value) {
      alert("Name and Email are required!");
      return;
    }

    setIsModalOpen(true);
  };

  // Confirm update
  const handleConfirmUpdate = async () => {
    setLoading(true);
    setError(null);

    let imagePath: string | null = null;

    if (selectedFile) {
      try {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("image-user")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading image:", uploadError.message);
          setError("Failed to upload image.");
          setLoading(false);
          setIsModalOpen(false);
          return;
        }

        imagePath = filePath;
      } catch (uploadError: Error) {
        console.error("Error during image upload:", uploadError.message);
        setError("Failed to upload image.");
        setLoading(false);
        setIsModalOpen(false);
        return;
      }
    }

    const updatedUser = {
      user_name: nameRef.current?.value,
      email: emailRef.current?.value,
      about_me: aboutMeRef.current?.value,
      ...(imagePath ? { image_url: imagePath } : {}),
    };

    try {
      const result = await updateUser(user?.id || "", updatedUser);

      if (result.success) {
        setSuccessMessage(result.message);
        const updatedProfile = await getUserById(user?.id || "");
        if (updatedProfile) {
          setUser(updatedProfile);
        } else {
          console.warn("Could not reload profile after update.");
          setError("Profile updated, but could not reload.");
        }
      } else {
        setError(result.error || "An error occurred while updating profile.");
      }
    } catch (error) {
      setError("An error occurred while updating profile.");
      console.error(error);
    }

    setLoading(false);
    setIsModalOpen(false);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle success message close
  const handleCloseAlert = () => {
    setSuccessMessage(null);
  };
  return (
    <motion.div className="container mx-auto px-10 py-10">
      <motion.h1 className="text-3xl font-bold mb-6" variants={{ initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.5 } } }}>
        Edit Profile
      </motion.h1>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="flex justify-between items-center bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6"
            variants={{ initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.5 } } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <span>{successMessage}</span>
            <button onClick={handleCloseAlert} className="text-xl font-semibold">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center items-center">Loading...</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : !user ? (
        <h1 className="text-3xl font-bold mb-6">User not found</h1>
      ) : (
        <motion.div className="flex justify-center space-x-8">
          <div className="w-3/4 bg-white rounded-lg shadow-lg flex flex-col p-6">
            <div className="flex items-center p-6">
              <motion.img
                src={user?.image_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/image-user/${user.image_url}` : "/default-avatar.png"}
                alt="User Avatar"
                className="w-24 h-24 rounded-full mr-6"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }}
              />
              <div className="ml-4">
                <h1 className="text-2xl font-bold">{user?.user_name}</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-4">Edit Profile</h2>

            <motion.form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-red-500 mb-4">{error}</div>}

              <motion.div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  ref={nameRef}
                  className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  defaultValue={user?.user_name || ""}
                />
              </motion.div>

              <motion.div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  ref={emailRef}
                  className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  defaultValue={user?.email || ""}
                />
              </motion.div>

              <motion.div className="mb-4">
                <label className="block text-sm font-semibold mb-2">About Me</label>
                <textarea
                  ref={aboutMeRef}
                  className="w-full border-2 border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself"
                  rows={4}
                  defaultValue={user?.about_me || ""}
                />
              </motion.div>

              <motion.div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Profile Picture</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="border-2 border-gray-300 rounded-md p-2 w-full"
                />
              </motion.div>

              <motion.button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600"
                disabled={loading}
                variants={{
                  initial: { opacity: 0.7 },
                  animate: { opacity: 1, transition: { duration: 0.3 } },
                }}
              >
                {loading ? "Updating..." : "Update Profile"}
              </motion.button>
            </motion.form>
          </div>
        </motion.div>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmUpdate}
        title="Confirm Update"
        message="Are you sure you want to update your profile?"
      />
    </motion.div>
  );
};


export default EditProfile;
