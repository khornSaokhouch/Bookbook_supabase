"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { X, ZoomIn } from "lucide-react"

interface RecipeGalleryProps {
  recipe: {
    image_urls?: string[]
  }
}

export default function Component({ recipe }: RecipeGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!recipe.image_urls || recipe.image_urls.length <= 1) {
    return null
  }

  return (
    <>
      <motion.section
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 mb-8 border border-orange-200/30 dark:border-gray-700/30"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,101,101,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(245,101,101,0.05),transparent_50%)]" />

        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent mb-2">
              Recipe Gallery
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Explore {recipe.image_urls.length} delicious views of this recipe
            </p>
          </motion.div>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {recipe.image_urls.map((url, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="break-inside-avoid group cursor-pointer"
                onClick={() => setSelectedImage(url)}
              >
                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="relative">
                    <Image
                      src={url || "/placeholder.svg"}
                      alt={`Recipe image ${index + 1}`}
                      width={400}
                      height={300}
                      unoptimized
                      className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Zoom icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <ZoomIn className="w-6 h-6 text-gray-800 dark:text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Image number badge */}
                  <div className="absolute top-3 left-3 bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-lg">
                    {index + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt="Recipe image enlarged"
                width={800}
                height={600}
                unoptimized
                className="w-full h-auto object-contain rounded-2xl shadow-2xl"
              />

              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-800 dark:text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
