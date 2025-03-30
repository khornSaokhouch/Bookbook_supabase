  "use client"; // Mark this as a Client Component

  import Image from "next/image";
  import { useState } from "react";
  import { motion } from "framer-motion";
  import { XCircle } from "lucide-react";

  interface ProfileImageModalProps {
    imageUrl: string | null | undefined; // Allow null or undefined
  }

  const ProfileImageModal = ({ imageUrl }: ProfileImageModalProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const backdropVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } },
    };

    const modalVariants = {
      hidden: { opacity: 0, scale: 0.7 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    };

    return (
      <>
        {/* Profile Image */}
        <div
          className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500 cursor-pointer"
          onClick={() => setIsModalOpen(true)} // Open modal on click
        >
          <Image
            src={imageUrl || "/default-profile.png"} // Use the user's image URL or a default image
            alt="User Avatar"
            fill // Use `fill` to make the image cover the container
            style={{ objectFit: "cover" }} // Ensure the image covers the container
            className="rounded-full"
            priority
          />
        </div>

        {/* Modal for Full-Size Image */}
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-opacity-70 flex items-center justify-center z-50 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsModalOpen(false); // Close modal on click outside the content area
              }
            }}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="relative w-full max-w-3xl p-4 bg-white rounded-lg shadow-xl"
              variants={modalVariants}
            >
              <Image
                src={imageUrl || "/default-profile.png"} // Use the user's image URL or a default image
                alt="Full-Size User Avatar"
                width={800} // Increased width
                height={800} // Increased height (Make it square)
                style={{ objectFit: "contain" }} // Ensure the image fits within the modal
                className="rounded-lg"
                priority
              />
              <button
                className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 focus:outline-none"
                onClick={() => setIsModalOpen(false)} // Close modal on button click
              >
                <XCircle className="w-8 h-8" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </>
    );
  };

  export default ProfileImageModal;