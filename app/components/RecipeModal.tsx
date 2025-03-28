import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // Import your Supabase client
import { motion } from "framer-motion"; // Import Framer Motion

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (category: { category_id: number; category_name: string }, occasion: { occasion_id: number; name: string }) => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onCategorySelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ category_id: number; category_name: string }[]>([]);
  const [occasions, setOccasions] = useState<{ occasion_id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true); // Add a loading state
  const [error, setError] = useState<string | null>(null);  // Add an error state

  useEffect(() => {
    const fetchCategoriesAndOccasions = async () => {
      setLoading(true);
      setError(null); // Clear any previous errors

      try {
        // Fetch Categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("category")
          .select("category_id, category_name");

        if (categoriesError) {
          throw new Error(categoriesError.message);
        }
        setCategories(categoriesData || []); // Ensure it's an array

        // Fetch Occasions
        const { data: occasionsData, error: occasionsError } = await supabase
          .from("occasion")
          .select("occasion_id, name");

        if (occasionsError) {
          throw new Error(occasionsError.message);
        }
        setOccasions(occasionsData || []); // Ensure it's an array
      } catch (err: any) {
        console.error("Error fetching categories and occasions:", err);
        setError(err.message || "Failed to load categories and occasions.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndOccasions();
  }, []);

  const handleOccasionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const occasionId = parseInt(event.target.value, 10);
    setSelectedOccasion(occasionId);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const categoryId = parseInt(event.target.value, 10);
    setSelectedCategory(categoryId);
  };

  const handleSave = () => {
    if (!selectedCategory || !selectedOccasion) {
      setError("Please select both a category and an occasion.");
      return;
    }

    // Find the selected category and occasion objects
    const category = categories.find(cat => cat.category_id === selectedCategory);
    const occasion = occasions.find(occ => occ.occasion_id === selectedOccasion);

    if (!category || !occasion) {
      console.error("Invalid category or occasion selected");
      return;
    }

    // Call the onCategorySelect function with the selected category and occasion objects
    onCategorySelect(category, occasion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
      {/* Modal Animation with Motion */}
      <motion.div
        className="bg-white rounded-lg w-[600px] h-[470px] shadow-xl p-6"
        initial={{ opacity: 0, y: 50 }}  // Modal starts below the screen and invisible
        animate={{ opacity: 1, y: 0 }}   // Modal slides up and fades in
        exit={{ opacity: 0, y: 50 }}     // Modal fades out and moves down when closing
        transition={{ type: "spring", stiffness: 300, damping: 30 }} // Smooth transition
      >
        <h2 className="text-3xl font-semibold mb-4 text-center text-gray-800">
          Which type of your <span className="text-blue-600">Recipe?</span>
        </h2>
        <p className="mb-6 text-center text-lg text-gray-600">
          Please choose a category and occasion for your recipe before posting!
        </p>

        {loading ? (
          <p className="text-center text-gray-500">Loading categories and occasions...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p> // Display the error message
        ) : (
          <div className="grid grid-cols-2 gap-6 justify-items-center">
            <div>
              <h3 className="font-medium mb-2 text-lg text-gray-700">Category</h3>
              {categories.map((category) => (
                <label key={category.category_id} className="flex items-center mb-3">
                  <input
                    type="radio"
                    value={category.category_id}
                    checked={selectedCategory === category.category_id}
                    onChange={handleCategoryChange}
                    className="mr-2 cursor-pointer w-5 h-5"
                  />
                  <span className="text-gray-700">{category.category_name}</span>
                </label>
              ))}
            </div>

            <div>
              <h3 className="font-medium mb-2 text-lg text-gray-700">Occasion</h3>
              {occasions.map((occasion) => (
                <label key={occasion.occasion_id} className="flex items-center mb-3">
                  <input
                    type="radio"
                    value={occasion.occasion_id}
                    checked={selectedOccasion === occasion.occasion_id}
                    onChange={handleOccasionChange}
                    className="mr-2 cursor-pointer w-5 h-5"
                  />
                  <span className="text-gray-700">{occasion.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleSave}
            className={`bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300 ${!selectedCategory || !selectedOccasion ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!selectedCategory || !selectedOccasion} // Disable the button if either is not selected
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-300"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RecipeModal;
