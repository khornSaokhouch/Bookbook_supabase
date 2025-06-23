"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "@/app/lib/supabaseClient";
import RecipeModal from "@/app/components/RecipeModal";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Clock,
  FileText,
  ImageIcon,
  Plus,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Camera,
  Flame,
  Heart,
  Info,
  List,
  BookOpen,
  StickyNote,
} from "lucide-react";

const AddRecipe = () => {
  const [recipeName, setRecipeName] = useState("");
  const [overview, setOverview] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [categoryOccasion, setCategoryOccasion] = useState<{
    categoryId: number | null;
    occasionId: number | null;
    categoryName?: string;
    occasionName?: string;
  }>({
    categoryId: null,
    occasionId: null,
  });
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("basics");
  const [formProgress, setFormProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // Calculate form completion progress
  useEffect(() => {
    let progress = 0;
    const requiredFields = [
      recipeName,
      overview,
      prepTime,
      cookTime,
      ingredients,
      instructions,
      description,
    ];
    const filledFields = requiredFields.filter(
      (field) => field.trim() !== ""
    ).length;
    progress = Math.round((filledFields / requiredFields.length) * 100);

    // Add extra progress if images are added
    if (imageFiles.some((file) => file !== null)) {
      progress += (100 - progress) * 0.2;
    }

    setFormProgress(Math.min(progress, 100));
  }, [
    recipeName,
    overview,
    prepTime,
    cookTime,
    ingredients,
    instructions,
    description,
    imageFiles,
  ]);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (sessionUser) {
        setUserId(sessionUser.id);
      } else {
        router.push("/login");
      }
    };

    fetchUserId();
  }, [router]);

  const addImageInput = () => {
    setImageFiles((prev) => [...prev, null]);
    setImagePreviews((prev) => [...prev, null]);
  };

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newImageFiles = [...imageFiles];
      const newImagePreviews = [...imagePreviews];

      newImageFiles[index] = file;
      newImagePreviews[index] = URL.createObjectURL(file);

      setImageFiles(newImageFiles);
      setImagePreviews(newImagePreviews);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCategorySelect = useCallback(
    (
      category: { category_id: number; category_name: string },
      occasion: { occasion_id: number; name: string }
    ) => {
      setCategoryOccasion({
        categoryId: category.category_id,
        occasionId: occasion.occasion_id,
        categoryName: category.category_name,
        occasionName: occasion.name,
      });
      setShowCategoryModal(false);
    },
    []
  );

  const uploadImage = async (file: File | null, path: string) => {
    if (!file) return null;

    const fileName = `${uuidv4()}-${file.name}`;
    const { error } = await supabase.storage
      .from("recipes") // Use the "recipes" bucket
      .upload(`${path}/${fileName}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error);
      throw new Error(error.message);
    }

    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipes/${path}/${fileName}`; // Construct the full URL
  };

  const actuallySubmit = useCallback(async () => {
    setUploadError(null);
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    if (!userId) {
      setUploadError("User ID is missing. Please log in.");
      setIsSubmitting(false);
      return;
    }

    if (!categoryOccasion.categoryId || !categoryOccasion.occasionId) {
      setUploadError("Please select a category and occasion.");
      setIsSubmitting(false);
      return;
    }

    try {
      const recipeId = uuidv4();

      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          if (file) {
            return await uploadImage(file, `${recipeId}/images`);
          }
          return null;
        })
      );

      const filteredImageUrls = imageUrls.filter(
        (url): url is string => url !== null
      );

      const prepTimeInterval = `PT${prepTime}M`;
      const cookTimeInterval = `PT${cookTime}M`;

      const { data, error } = await supabase
        .from("recipe")
        .insert([
          {
            user_id: userId,
            category_id: categoryOccasion.categoryId,
            occasion_id: categoryOccasion.occasionId,
            recipe_name: recipeName,
            overview: overview,
            prep_time: prepTimeInterval,
            cook_time: cookTimeInterval,
            ingredients: ingredients,
            instructions: instructions,
            description: description,
            note: note,
          },
        ])
        .select()
        .single();

      if (error) {
        setUploadError(error.message);
        setErrorMessage("Failed to add recipe. Please try again.");
        setIsSubmitting(false);
        return;
      }

      for (const imageUrl of filteredImageUrls) {
        const { error: imageError } = await supabase
          .from("image_recipe")
          .insert([
            {
              recipe_id: data.recipe_id,
              image_url: imageUrl, // Insert the full image URL
            },
          ]);

        if (imageError) {
          setUploadError(imageError.message);
          setErrorMessage("Failed to add image to recipe. Please try again.");
        }
      }

      setSuccessMessage("Recipe added successfully!");
      setShowSuccessModal(true);
      setShowConfetti(true);
      setIsSubmitting(false);

      // Reset form
      setRecipeName("");
      setOverview("");
      setPrepTime("");
      setCookTime("");
      setIngredients("");
      setInstructions("");
      setDescription("");
      setNote("");
      setCategoryOccasion({ categoryId: null, occasionId: null });
      setImageFiles([null]);
      setImagePreviews([null]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setUploadError(error.message || "An unexpected error occurred.");
      }
      setIsSubmitting(false);
    }
  }, [
    categoryOccasion.categoryId,
    categoryOccasion.occasionId,
    imageFiles,
    prepTime,
    cookTime,
    userId,
    recipeName,
    overview,
    ingredients,
    instructions,
    description,
    note,
  ]);

  useEffect(() => {
    if (
      categoryOccasion.categoryId !== null &&
      categoryOccasion.occasionId !== null
    ) {
      actuallySubmit();
    }
  }, [
    categoryOccasion.categoryId,
    categoryOccasion.occasionId,
    actuallySubmit,
  ]);

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    router.push("/");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowCategoryModal(true);
  };

  const renderImagePreview = (preview: string | null, index: number) => (
    <motion.div
      key={index}
      className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 shadow-md group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageChange(e, index)}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      {preview ? (
        <div className="relative w-full h-full">
          <Image
            src={preview || "/placeholder.svg"}
            alt={`Recipe preview ${index + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <Camera className="h-12 w-12 text-orange-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Add a delicious photo
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Click to browse
          </p>
        </div>
      )}

      {preview && (
        <motion.button
          type="button"
          onClick={() => handleRemoveImage(index)}
          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors duration-200 z-20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-4 w-4" />
        </motion.button>
      )}
    </motion.div>
  );

  // Navigation tabs for form sections
  const formSections = [
    { id: "basics", label: "Basics", icon: <ChefHat className="h-4 w-4" /> },
    { id: "details", label: "Details", icon: <FileText className="h-4 w-4" /> },
    {
      id: "ingredients",
      label: "Ingredients",
      icon: <List className="h-4 w-4" />,
    },
    {
      id: "instructions",
      label: "Instructions",
      icon: <BookOpen className="h-4 w-4" />,
    },
    { id: "images", label: "Images", icon: <ImageIcon className="h-4 w-4" /> },
  ];

  // Confetti animation
  const Confetti = () => {
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: [
                "#FF5733",
                "#33FF57",
                "#3357FF",
                "#F3FF33",
                "#FF33F3",
                "#33FFF3",
                "#FF9933",
                "#33FF99",
                "#9933FF",
                "#99FF33",
                "#FF3399",
                "#3399FF",
              ][Math.floor(Math.random() * 12)],
              top: `${Math.random() * -10}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: `${100 + Math.random() * 20}vh`,
              x:
                Math.random() > 0.5
                  ? Math.random() * 100
                  : Math.random() * -100,
              rotate: Math.random() * 360,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              ease: "easeOut",
              delay: Math.random() * 0.5,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10 px-4 sm:px-6">
      {showConfetti && <Confetti />}

      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back button */}
        <motion.button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 dark:text-gray-300 mb-6 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back to recipes</span>
        </motion.button>

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-orange-200 dark:border-orange-700 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ChefHat className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recipe Creator
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Share Your Culinary Magic ✨
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Let is create something delicious together! Your recipe could be
            someone is next favorite meal.
          </motion.p>
        </div>

        {/* Progress bar */}
        <motion.div
          className="mb-8 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 max-w-3xl mx-auto"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="bg-gradient-to-r from-orange-500 to-pink-500 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${formProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </motion.div>

        {/* Form navigation tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 md:space-x-4 justify-center min-w-max">
            {formSections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                    : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-green-800 dark:text-green-300">
                {successMessage}
              </span>
            </motion.div>
          )}

          {(errorMessage || uploadError) && (
            <motion.div
              className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <span className="text-red-800 dark:text-red-300">
                {errorMessage || uploadError}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form */}
        <motion.div
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <form ref={formRef} onSubmit={handleSubmit} className="p-8">
            {/* Basics Section */}
            <AnimatePresence mode="wait">
              {activeSection === "basics" && (
                <motion.div
                  key="basics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <ChefHat className="h-6 w-6 text-orange-500" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Recipe Basics
                    </h2>
                  </div>

                  {/* Recipe Name */}
                  <div>
                    <label
                      htmlFor="recipeName"
                      className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300"
                    >
                      Recipe Name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      id="recipeName"
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                      placeholder="What's your culinary masterpiece called?"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Overview */}
                  <div>
                    <label
                      htmlFor="overview"
                      className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300"
                    >
                      Overview <span className="text-orange-500">*</span>
                    </label>
                    <textarea
                      id="overview"
                      value={overview}
                      onChange={(e) => setOverview(e.target.value)}
                      placeholder="Tell us about your recipe! What makes it special? What inspired you?"
                      className="w-full h-32 border border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Preparation and Cook Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="prepTime"
                        className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300"
                      >
                        Preparation Time{" "}
                        <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          id="prepTime"
                          type="number"
                          value={prepTime}
                          onChange={(e) => setPrepTime(e.target.value)}
                          placeholder="Minutes"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-4 pl-12 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="cookTime"
                        className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300"
                      >
                        Cook Time <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <Flame className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          id="cookTime"
                          type="number"
                          value={cookTime}
                          onChange={(e) => setCookTime(e.target.value)}
                          placeholder="Minutes"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-4 pl-12 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      type="button"
                      onClick={() => setActiveSection("details")}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next: Details
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Details Section */}
              {activeSection === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <FileText className="h-6 w-6 text-orange-500" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Recipe Details
                    </h2>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300"
                    >
                      Description <span className="text-orange-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your recipe in detail. What does it taste like? What textures can people expect? What makes it unique?"
                      className="w-full h-40 border border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label
                      htmlFor="note"
                      className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center"
                    >
                      Chef is Notes{" "}
                      <span className="text-gray-400 text-sm ml-2">
                        (Optional)
                      </span>
                    </label>
                    <div className="relative">
                      <StickyNote className="absolute left-4 top-6 transform -translate-y-1/2 text-gray-400" />
                      <textarea
                        id="note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Share your kitchen secrets! Ingredient substitutions, special techniques, or any tips for recipe success."
                        className="w-full h-32 border border-gray-300 dark:border-gray-600 rounded-xl p-4 pl-12 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <motion.button
                      type="button"
                      onClick={() => setActiveSection("basics")}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setActiveSection("ingredients")}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next: Ingredients
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Ingredients Section */}
              {activeSection === "ingredients" && (
                <motion.div
                  key="ingredients"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <List className="h-6 w-6 text-orange-500" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Ingredients
                    </h2>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4 mb-6">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-orange-800 dark:text-orange-300">
                        List each ingredient on a new line. Include quantities
                        and any preparation notes .
                      </p>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <label
                      htmlFor="ingredients"
                      className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300"
                    >
                      Ingredients List{" "}
                      <span className="text-orange-500">*</span>
                    </label>
                    <textarea
                      id="ingredients"
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      placeholder="2 cups all-purpose flour
1/4 cup granulated sugar
1 tsp baking powder
1/2 tsp salt
..."
                      className="w-full h-64 border border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-mono"
                      required
                    />
                  </div>

                  <div className="flex justify-between">
                    <motion.button
                      type="button"
                      onClick={() => setActiveSection("details")}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setActiveSection("instructions")}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next: Instructions
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Instructions Section */}
              {activeSection === "instructions" && (
                <motion.div
                  key="instructions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <BookOpen className="h-6 w-6 text-orange-500" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Cooking Instructions
                    </h2>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4 mb-6">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-orange-800 dark:text-orange-300">
                        Number each step and be specific. Include temperatures,
                        times, and visual cues .
                      </p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label
                      htmlFor="instructions"
                      className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300"
                    >
                      Step-by-Step Instructions{" "}
                      <span className="text-orange-500">*</span>
                    </label>
                    <textarea
                      id="instructions"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="1. Preheat oven to 350°F (175°C).
2. In a large bowl, combine flour, sugar, baking powder, and salt.
3. In a separate bowl, whisk together eggs, milk, and vanilla.
..."
                      className="w-full h-64 border border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-mono"
                      required
                    />
                  </div>

                  <div className="flex justify-between">
                    <motion.button
                      type="button"
                      onClick={() => setActiveSection("ingredients")}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setActiveSection("images")}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next: Add Images
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Images Section */}
              {activeSection === "images" && (
                <motion.div
                  key="images"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <ImageIcon className="h-6 w-6 text-orange-500" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Recipe Images
                    </h2>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4 mb-6">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-orange-800 dark:text-orange-300">
                        Great photos help your recipe shine! Add images of the
                        finished dish and key preparation steps if possible.
                      </p>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                      Recipe Photos
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {imagePreviews.map((preview, index) =>
                        renderImagePreview(preview, index)
                      )}

                      <motion.button
                        type="button"
                        onClick={addImageInput}
                        className="aspect-square rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-700 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus className="h-8 w-8 text-orange-500 mb-2" />
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          Add More Photos
                        </span>
                      </motion.button>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <motion.button
                      type="button"
                      onClick={() => setActiveSection("instructions")}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          <span>Saving Recipe...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          <span>Save Recipe</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Recipe Modal */}
        <RecipeModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onCategorySelect={handleCategorySelect}
        />

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSuccessModal}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl max-w-md w-full relative overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Success background glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-3xl blur opacity-30"></div>

                <div className="relative text-center">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.2,
                    }}
                  >
                    <CheckCircle className="h-10 w-10 text-white" />
                  </motion.div>

                  <motion.h2
                    className="text-3xl font-bold text-gray-800 dark:text-white mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Recipe Published! 🎉
                  </motion.h2>

                  <motion.p
                    className="text-gray-600 dark:text-gray-300 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Your delicious creation has been shared with the world.
                    Thank you for contributing to our culinary community!
                  </motion.p>

                  <div className="flex space-x-4">
                    <motion.button
                      onClick={closeSuccessModal}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Heart className="h-5 w-5 mr-2 inline" />
                      View My Recipes
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        setShowSuccessModal(false);
                        setActiveSection("basics");
                        formRef.current?.reset();
                      }}
                      className="flex-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Plus className="h-5 w-5 mr-2 inline" />
                      Create Another
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AddRecipe;
