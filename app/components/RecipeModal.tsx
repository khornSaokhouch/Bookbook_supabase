import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // Import your Supabase client

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
      alert("Please select both a category and an occasion.");
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
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg  w-[600px] h-[470px] shadow-lg p-10">
        <h2 className="text-4xl font-semibold mb-4 text-center">
          Which type of your <a className="text-4xl text-blue-600">Recipe?</a>
        </h2>
        <p className="mb-4 text-center text-lg">
          Please choose type of recipe before you post!
        </p>

        {loading ? (
          <p>Loading categories and occasions...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 justify-items-center"> {/* Wrap category and occasion in a grid */}
            <div>
              <h3 className="font-medium mb-2 text-lg">Category</h3>
              {categories.map((category) => (
                <label key={category.category_id} className="block mb-1 text-left">
                  <input
                    type="radio" // Changed to radio buttons
                    value={category.category_id}
                    checked={selectedCategory === category.category_id} // Check if this option is selected
                    onChange={handleCategoryChange}
                    className="mr-2 cursor-pointer w-5 h-5"
                  />
                  {category.category_name}
                </label>
              ))}
            </div>

            <div>
              <h3 className="font-medium mb-2 text-lg">Occasion</h3>
              {occasions.map((occasion) => (
                <label key={occasion.occasion_id} className="block mb-1 text-left">
                  <input
                    type="radio" // Changed to radio buttons
                    value={occasion.occasion_id}
                    checked={selectedOccasion === occasion.occasion_id} // Check if this option is selected
                    onChange={handleOccasionChange}
                    className="mr-2 cursor-pointer w-5 h-5"
                  />
                  {occasion.name}
                </label>
              ))}
            </div>
          </div>
        )}


        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition duration-300"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition duration-300"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default RecipeModal;