// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { XCircle, AlertTriangle } from "lucide-react";

// interface DeleteEventModalProps {
//   onDelete: () => void;
//   onCancel: () => void;
//   deleting: boolean;
// }

// const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
//   onDelete,
//   onCancel,
//   deleting,
// }) => {
//   const backdropVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1 },
//   };

//   const modalVariants = {
//     hidden: { opacity: 0, scale: 0.8 },
//     visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
//   };

//   return (
//     <motion.div
//       className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-50"
//       variants={backdropVariants}
//       initial="hidden"
//       animate="visible"
//       exit="hidden"
//     >
//       <motion.div
//         className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full"
//         variants={modalVariants}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center">
//             <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
//             <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
//               Confirm Delete
//             </h2>
//           </div>
//           <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
//             <XCircle className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Message */}
//         <p className="text-gray-700 dark:text-gray-300 mb-6">
//           Are you sure you want to delete this event? This action cannot be
//           undone.
//         </p>

//         {/* Actions */}
//         <div className="flex justify-end space-x-2">
//           <button
//             type="button"
//             onClick={onCancel}
//             className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={onDelete}
//             className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors"
//             disabled={deleting}
//           >
//             {deleting ? "Deleting..." : "Delete"}
//           </button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default DeleteEventModal;