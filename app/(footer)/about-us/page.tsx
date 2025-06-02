"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Facebook,
  Send,
  Github,
  Youtube,
  Heart,
  Star,
  ChefHat,
  Users,
  Target,
  Sparkles,
  Coffee,
  Utensils,
} from "lucide-react";

const AboutUs = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.7, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, type: "spring", stiffness: 50 },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };

  const teamMembers = [
    {
      name: "Mr. Sen Vibol",
      image: "/vibol.jpg",
      role: "Lead Developer & Recipe Curator",
      description:
        "Passionate about creating seamless user experiences and discovering authentic recipes.",
      social: {
        facebook: "https://www.facebook.com/vibolsen02",
        telegram: "https://t.me/vibolsen",
        github: "https://github.com/VibolSen",
      },
    },
    {
      name: "Mr. Khorn Soukhouch",
      image: "/khouch.png",
      role: "Full-Stack Developer & Food Photographer",
      description:
        "Combines technical expertise with artistic vision to bring recipes to life&apos;",
      social: {
        facebook: "https://www.facebook.com/khorn.saokhouch.2025",
        telegram: "https://t.me/khouch04",
        github: "https://github.com/khornSaokhouch",
      },
    },
    {
      name: "Ms. Sam Nisa",
      image: "/nisa.jpg",
      role: "UI/UX Designer & Culinary Writer",
      description:
        "Creates beautiful interfaces and crafts compelling stories behind every dish.",
      social: {
        facebook: "https://www.facebook.com/sam.nisa.35/",
        telegram: "https://t.me/Samnisa21",
        github: "https://github.com/Sam-Nisa",
      },
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 left-10 text-green-200 dark:text-green-800"
        >
          <ChefHat size={40} />
        </motion.div>
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-40 right-20 text-emerald-200 dark:text-emerald-800"
          style={{ animationDelay: "1s" }}
        >
          <Utensils size={35} />
        </motion.div>
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute bottom-40 left-20 text-teal-200 dark:text-teal-800"
          style={{ animationDelay: "2s" }}
        >
          <Coffee size={30} />
        </motion.div>
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute bottom-20 right-10 text-green-200 dark:text-green-800"
          style={{ animationDelay: "3s" }}
        >
          <Heart size={25} />
        </motion.div>
      </div>

      <motion.div
        className="container mx-auto p-6 md:p-8 lg:p-10 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.section
          className="text-center py-20 relative overflow-hidden"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-3xl opacity-90 dark:opacity-80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>

          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 text-white/30">
            <Sparkles size={60} />
          </div>
          <div className="absolute bottom-10 right-10 text-white/30">
            <Star size={50} />
          </div>

          <div className="relative z-10 text-white">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg"
            >
              <Heart className="w-4 h-4" />
              About Our Journey
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Welcome to{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                CookBook
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-light"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Where the joy of cooking meets the art of storytelling! Our
              passion is simple: we love food, and we believe that every meal
              tells a story worth sharing.
            </motion.p>

            <motion.div
              className="flex justify-center gap-4 mt-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">3 Team Members</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <ChefHat className="w-5 h-5" />
                <span className="text-sm font-medium">100+ Recipes</span>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section className="py-20" variants={itemVariants}>
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-4 shadow-lg"
            >
              <Users className="w-4 h-4" />
              Meet Our Team
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              The Culinary Creators
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We aim to make cooking accessible and enjoyable for everyone, no
              matter your skill level or experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="group relative"
                variants={itemVariants}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="relative mb-6">
                      <div className="w-32 h-32 mx-auto relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                        <Image
                          src={member.image || "/placeholder.svg"}
                          alt={member.name}
                          width={128}
                          height={128}
                          className="rounded-full w-full h-full object-cover border-4 border-white dark:border-gray-700 relative z-10"
                        />
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-full shadow-lg">
                          <ChefHat className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      {member.name}
                    </h3>
                    <p className="text-green-600 dark:text-green-400 font-semibold mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                      {member.description}
                    </p>

                    <div className="flex justify-center gap-4">
                      <motion.a
                        href={member.social.facebook}
                        className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Facebook"
                      >
                        <Facebook className="w-5 h-5" />
                      </motion.a>
                      <motion.a
                        href={member.social.telegram}
                        className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Telegram"
                      >
                        <Send className="w-5 h-5" />
                      </motion.a>
                      <motion.a
                        href={member.social.github}
                        className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="GitHub"
                      >
                        <Github className="w-5 h-5" />
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Vision Section */}
        <motion.section
          className="py-20"
          variants={itemVariants}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-3xl p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10">
                <Utensils size={100} className="text-green-400" />
              </div>
              <div className="absolute bottom-10 right-10">
                <ChefHat size={120} className="text-teal-400" />
              </div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg"
              >
                <Target className="w-4 h-4" />
                Our Vision
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
                Cooking for Everyone, Everywhere
              </h2>

              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                <strong>What drives us forward?</strong>
              </p>

              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Our team is made up of food enthusiasts, recipe developers, and
                culinary storytellers. We are committed to testing and refining
                every recipe, so you can be confident that when you cook with
                us, you&apos;re making something truly special.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                    Passion
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Every recipe is crafted with love and tested with care
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                    Community
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Building connections through shared culinary experiences
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                    Innovation
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Constantly evolving to bring you the best cooking experience
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <motion.a
                  href="#"
                  className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Telegram"
                >
                  <Send className="w-6 h-6" />
                </motion.a>
                <motion.a
                  href="#"
                  className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </motion.a>
                <motion.a
                  href="#"
                  className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="GitHub"
                >
                  <Github className="w-6 h-6" />
                </motion.a>
                <motion.a
                  href="#"
                  className="p-4 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-300"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="YouTube"
                >
                  <Youtube className="w-6 h-6" />
                </motion.a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          className="text-center py-16"
          variants={itemVariants}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Cooking?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join our community and discover amazing recipes today!
              </p>
              <motion.button
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChefHat className="w-5 h-5" />
                Explore Recipes
              </motion.button>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default AboutUs;
