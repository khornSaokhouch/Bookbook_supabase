import { motion } from "framer-motion";
import Image from "next/image";

type ProfileImageModalProps = {
  imageUrl: string;
  onClose: () => void;
};

export default function ProfileImageModal({
  imageUrl,
  onClose,
}: ProfileImageModalProps) {
  return (
    <div className="fixed inset-0  bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50">
      <motion.div
        className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-lg shadow-xl relative max-w-lg w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
        <button
          className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-600 transition-all"
          onClick={onClose}
        >
          X
        </button>
        <div className="flex justify-center mb-4">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt="Profile Image"
            width={140}
            height={140}
            className="w-46 h-46 sm:w-72 sm:h-72 rounded-full border-4 border-white shadow-xl object-cover cursor-pointer"
          />
        </div>

        <p className="text-center text-gray-700 text-lg font-semibold mt-2">
          Profile Image
        </p>
      </motion.div>
    </div>
  );
}
