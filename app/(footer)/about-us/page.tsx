"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTelegram,
  faGithub,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const AboutUs = () => {
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
      className="container mx-auto p-6 md:p-8 lg:p-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section
        className="text-center py-16 bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-xl"
        variants={itemVariants}
      >
        <button className="bg-blue-600 dark:bg-blue-500 text-white px-5 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors duration-300">
          About Us
        </button>
        <h1 className="text-4xl font-bold mt-5 dark:text-white">
          Welcome to <span className="text-5xl text-blue-700 dark:text-blue-300">CookBook</span>
        </h1>
        <p className="mt-5 max-w-3xl mx-auto text-lg">
          Where the joy of cooking meets the art of storytelling! Our passion is simple: we love food, and we believe that every meal tells a story.
        </p>
      </motion.section>

      {/* Team Section */}
      <motion.section className="text-center py-16" variants={itemVariants}>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Our Team Members</h2>
        <p className="mt-3 mb-8 text-gray-600 dark:text-gray-400 text-lg">
          We aim to make cooking accessible and enjoyable for everyone, no matter your skill level.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Team Member 1 */}
          {/* Team Member 1 */}
          <motion.div
            className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden p-6 hover:scale-105 transition duration-300"
            variants={itemVariants}
          >
            <Image
              src="/vibol.png"
              alt="Sen Vibol"
              width={250}
              height={250}
              className="rounded-full w-48 h-48 mx-auto object-cover border-4 border-blue-400 dark:border-blue-500"
            />
            <p className="mt-5 text-xl font-semibold text-gray-800 dark:text-gray-200">Mr. Sen Vibol</p>
            <div className="flex justify-center gap-4 mt-4">
              <a href="https://www.facebook.com/vibolsen02" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-300" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </a>
              <a href="https://t.me/vibolsen" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-300" aria-label="Telegram">
                <FontAwesomeIcon icon={faTelegram} size="lg" />
              </a>
              <a href="https://github.com/VibolSen" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-300" aria-label="GitHub">
                <FontAwesomeIcon icon={faGithub} size="lg" />
              </a>
            </div>
          </motion.div>
          {/* Team Member 2 */}
          <motion.div
            className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden p-6 hover:scale-105 transition duration-300"
            variants={itemVariants}
          >
            <Image
              src="/khouch.png"
              alt="Khorn Soukhouch"
              width={250}
              height={250}
              className="rounded-full w-48 h-48 mx-auto object-cover border-4 border-blue-400 dark:border-blue-500"
            />
            <p className="mt-5 text-xl font-semibold text-gray-800 dark:text-gray-200">Mr. Khorn Soukhouch</p>
            <div className="flex justify-center gap-4 mt-4">
              <a href="https://www.facebook.com/khorn.saokhouch.2025" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-300" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </a>
              <a href="https://t.me/khouch04" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-300" aria-label="Telegram">
                <FontAwesomeIcon icon={faTelegram} size="lg" />
              </a>
              <a href="https://github.com/khornSaokhouch" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-300" aria-label="GitHub">
                <FontAwesomeIcon icon={faGithub} size="lg" />
              </a>
            </div>
          </motion.div>
          {/* Team Member 3 */}
          <motion.div
            className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden p-6 hover:scale-105 transition duration-300"
            variants={itemVariants}
          >
            <Image
              src="/Nisa.png"
              alt="Sam Nisa"
              width={250}
              height={250}
              className="rounded-full w-48 h-48 mx-auto object-cover border-4 border-blue-400 dark:border-blue-500"
            />
            <p className="mt-5 text-xl font-semibold text-gray-800 dark:text-gray-200">Ms. Sam Nisa</p>
            <div className="flex justify-center gap-4 mt-4">
              <a href="https://www.facebook.com/sam.nisa.35/" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-300" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </a>
              <a href="https://t.me/Samnisa21" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-300" aria-label="Telegram">
                <FontAwesomeIcon icon={faTelegram} size="lg" />
              </a>
              <a href="https://github.com/Sam-Nisa" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-300" aria-label="GitHub">
                <FontAwesomeIcon icon={faGithub} size="lg" />
              </a>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Visions Section */}
      <motion.section
        className="bg-blue-50 dark:bg-blue-900 rounded-lg py-16 px-8 flex items-center justify-center"
        variants={itemVariants}
      >
        <div className="text-center lg:text-left lg:flex items-center gap-8">
          <div>
            <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-4">Our Vision</h2>
            <p className="text-gray-700 dark:text-gray-300 font-semibold mb-3">What is our vision to do next?</p>
            <p className="max-w-3xl text-gray-600 dark:text-gray-400 text-lg">
              Our team is made up of food enthusiasts, recipe developers, and culinary storytellers. We are committed to testing and refining every recipe, so you can be confident that when you cook with us, you’re making something truly special.
            </p>
            <div className="flex justify-center lg:justify-start gap-4 mt-6">
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-300" aria-label="Telegram">
                <FontAwesomeIcon icon={faTelegram} size="lg" />
              </a>
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-300" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </a>
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-300" aria-label="GitHub">
                <FontAwesomeIcon icon={faGithub} size="lg" />
              </a>
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-300" aria-label="YouTube">
                <FontAwesomeIcon icon={faYoutube} size="lg" />
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default AboutUs;