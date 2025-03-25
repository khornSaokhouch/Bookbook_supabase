// "use client";

// import React from "react";
// import { motion } from "framer-motion";

// const HomePage = () => {
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { duration: 0.5 } },
//   };

//   return (
//     <motion.div
//       className="container mx-auto p-4 md:p-8"
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//     >
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
//         <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-4">
//           Welcome to CookBook Admin!
//         </h1>
//         <p className="text-gray-600 dark:text-gray-400 mb-6">
//           This is your central hub for managing all aspects of the CookBook
//           application.
//         </p>

//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
//             Quick Actions
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded">
//               Manage Users
//             </button>
//             <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded">
//               Add New Recipe
//             </button>
//             <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded">
//               Review Events
//             </button>
//           </div>
//         </section>

//         <section>
//           <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
//             Key Metrics
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
//               <h3 className="text-lg font-medium text-gray-800 dark:text-white">
//                 Total Users
//               </h3>
//               <p className="text-2xl font-bold text-blue-500">1,256</p>
//             </div>
//             <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
//               <h3 className="text-lg font-medium text-gray-800 dark:text-white">
//                 Total Recipes
//               </h3>
//               <p className="text-2xl font-bold text-green-500">452</p>
//             </div>
//           </div>
//         </section>
//       </div>
//     </motion.div>
//   );
// };

// export default HomePage;