"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail as Envelope, PhoneCall as Phone, MapPin } from "lucide-react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error on change
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;
  
    // Initialize newErrors with the correct structure
    const newErrors: { firstName: string; lastName: string; email: string; phone: string; message: string } = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    };
  
    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }
  
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }
  
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }
  
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    }
  
    if (!formData.message) {
      newErrors.message = "Message is required";
      isValid = false;
    }
  
    setErrors(newErrors); // Now this will work without a TypeScript error
  
    if (isValid) {
      // Simulate form submission
      alert("Form submitted successfully!");
      setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" }); // Reset form
    }
  };
  

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.7, staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring", stiffness: 50 } },
  };

  return (
    <motion.div
      className="container mx-auto p-6 md:p-8 xl:p-10" // Increased padding on larger screens
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="bg-gray-50 dark:bg-gray-900 py-12 px-6 rounded-lg shadow-xl max-w-5xl xl:max-w-6xl mx-auto" // Increased max-w on larger screens
        variants={itemVariants}
      >
        <h1 className="text-3xl xl:text-4xl font-bold text-center text-gray-800 dark:text-white mb-4">Contact Us</h1> {/* Larger text on larger screens */}
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-lg">Any questions or remarks? Just write us a message!</p> {/* Larger text on larger screens */}

        <div className="md:flex md:space-x-8 xl:space-x-12"> {/* Increased spacing on larger screens */}
          {/* Contact Information Section */}
          <motion.div
            className="md:w-1/3 mb-8 md:mb-0"
            variants={itemVariants}
          >
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Say something to start a live chat!</p>
              <div className="text-gray-600 dark:text-gray-300 mb-4 flex items-center">
                <Phone className="mr-2 h-5 w-5 text-blue-500" />
                +1012 3456 789
              </div>
              <div className="text-gray-600 dark:text-gray-300 mb-4 flex items-center">
                <Envelope className="mr-2 h-5 w-5 text-blue-500" />
                demo@gmail.com
              </div>
              <div className="text-gray-600 dark:text-gray-300 flex items-start">
                <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                <div>
                  Map data ©2024 Terms<br />
                  Royal University of Phnom Penh<br />
                  Penh4.5 (252) University<br />
                  Open - Closes 5 pm<br />
                  (110) - 023 883 640
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div
            className="md:w-2/3"
            variants={itemVariants}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="md:flex md:space-x-4">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={`w-full border ${errors.firstName ? "border-red-500" : "border-gray-300"} dark:bg-gray-800 dark:border-gray-700 dark:text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className={`w-full border ${errors.lastName ? "border-red-500" : "border-gray-300"} dark:bg-gray-800 dark:border-gray-700 dark:text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full border ${errors.email ? "border-red-500" : "border-gray-300"} dark:bg-gray-800 dark:border-gray-700 dark:text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`w-full border ${errors.phone ? "border-red-500" : "border-gray-300"} dark:bg-gray-800 dark:border-gray-700 dark:text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder="Write your message..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className={`w-full border ${errors.message ? "border-red-500" : "border-gray-300"} dark:bg-gray-800 dark:border-gray-700 dark:text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={4}
                />
                {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
              </div>
              <button
                type="submit"
                className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 p-3 rounded text-white w-full transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContactUs;