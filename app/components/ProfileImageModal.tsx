// components/ProfileImageModal.tsx
"use client"; // Mark this as a Client Component

import Image from "next/image";
import { useState } from "react";

interface ProfileImageModalProps {
    imageUrl: string | null | undefined; // Allow null or undefined
}

const ProfileImageModal = ({ imageUrl }: ProfileImageModalProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                <div
                    className="fixed inset-0 bg-opacity-75 flex items-center justify-center z-50"
                    onClick={() => setIsModalOpen(false)} // Close modal on click outside
                >
                    <div className="relative w-full max-w-3xl p-4 m-auto">
                        <Image
                            src={imageUrl || "/default-profile.png"} // Use the user's image URL or a default image
                            alt="Full-Size User Avatar"
                            width={500} // Adjust the width as needed
                            height={500} // Adjust the height as needed  (Make it square)
                            style={{ objectFit: "contain" }} // Ensure the image fits within the modal
                            className="rounded-lg"
                            priority
                        />
                        <button
                            className="absolute top-4 right-4 text-white text-2xl"
                            onClick={() => setIsModalOpen(false)} // Close modal on button click
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileImageModal;