"use client";

import type React from "react";

import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faLinkedin,
  faTwitter,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import {
  faLocationDot,
  faPhone,
  faEnvelope,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const socialLinks = [
    {
      icon: faFacebook,
      href: "#",
      label: "Facebook",
      color: "hover:text-blue-600",
    },
    {
      icon: faLinkedin,
      href: "#",
      label: "LinkedIn",
      color: "hover:text-blue-500",
    },
    {
      icon: faTwitter,
      href: "#",
      label: "Twitter",
      color: "hover:text-sky-400",
    },
    {
      icon: faInstagram,
      href: "#",
      label: "Instagram",
      color: "hover:text-pink-500",
    },
    {
      icon: faYoutube,
      href: "#",
      label: "YouTube",
      color: "hover:text-red-500",
    },
  ];

  const footerLinks = [
    { href: "/about-us", label: "About Us" },
    { href: "/contact-us", label: "Contact Us" },
    { href: "/faq", label: "FAQ" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/disclaimer", label: "Disclaimer" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Decorative Top Border */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <motion.div
        className="container mx-auto px-6 sm:px-8 lg:px-12 py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Logo & Description Section */}
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            <div className="flex items-center mb-6">
              <Link href="/" className="flex items-center group">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="CookBook Logo"
                    width={80}
                    height={80}
                    className="transition-transform duration-300 group-hover:scale-110"
                    style={{ height: "auto", width: "auto" }} // ✅ Maintain aspect ratio
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  CookBook
                </span>
              </Link>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 max-w-md">
              Discover, create, and share amazing recipes with our vibrant
              cooking community. Your culinary journey starts here! 🍳✨
            </p>

            {/* Social Media Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className={`group relative p-3 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 ${social.color} transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-110 hover:shadow-lg`}
                  aria-label={social.label}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FontAwesomeIcon icon={social.icon} size="lg" />
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {social.label}
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links Section */}
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <nav className="space-y-3">
              {footerLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 py-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>

          {/* Contact Info Section */}
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Get In Touch
            </h3>
            <div className="space-y-4">
              <motion.div
                className="flex items-start group"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="text-blue-500 dark:text-blue-400"
                  />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Royal University Of Phnom Penh
                    <br />
                    Faculty Engineering, Department ITE
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center group"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors duration-300">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-green-500 dark:text-green-400"
                  />
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  (855) 456-7890
                </p>
              </motion.div>

              <motion.div
                className="flex items-center group"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors duration-300">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-purple-500 dark:text-purple-400"
                  />
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  hello@cookbook.com
                </p>
              </motion.div>
            </div>

            {/* Newsletter Signup */}
            <motion.div
              className="mt-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
              variants={itemVariants}
            >
              <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                Stay Updated! 📧
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Get the latest recipes and cooking tips delivered to your inbox.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                />
                <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-r-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold">
                  Subscribe
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <span>© {new Date().getFullYear()} CookBook. Made with</span>
              <FontAwesomeIcon
                icon={faHeart}
                className="mx-2 text-red-500 animate-pulse"
              />
              <span>for food lovers everywhere</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <Link
                href="/terms"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300"
              >
                Cookie Policy
              </Link>
              <Link
                href="/sitemap"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Elements */}
      <div className="h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
    </footer>
  );
};

export default Footer;
