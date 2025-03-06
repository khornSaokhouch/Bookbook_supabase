import { useState } from "react";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (category: string) => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onCategorySelect,
}) => {
  const [foodOptions, setFoodOptions] = useState<string[]>([]);
  const [occasionOptions, setOccasionOptions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleFoodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFoodOptions((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const [isRecipeModalOpen, setRecipeModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  const handlePost = () => {
    // Logic for posting the recipe
    // After successful post:
    setSuccessModalOpen(true);
    setRecipeModalOpen(false); // Close the recipe modal
  };

  const handleOccasionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOccasionOptions((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleSave = () => {
    onCategorySelect(selectedCategory);
  };

  const handleSubmit = () => {
    console.log("Foods:", foodOptions);
    console.log("Occasions:", occasionOptions);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg  w-[600px] h-[470px] shadow-lg p-10">
        <h2 className="text-4xl font-semibold mb-4 text-center">
          Which type of your <a className="text-4xl text-blue-600">Recipe?</a>
        </h2>
        <p className="mb-4 text-center text-lg">
          Please choose type of recipe before you post!
        </p>

        <div className="mb-4 grid grid-cols-2 gap-4 justify-items-center">
          <div className="text-lg text-center  space-y-2 ">
            <h3 className="font-medium mb-2">Foods</h3>
            {[
              "Soups",
              "Stir-fries",
              "Healthy",
              "Vegetable",
              "Dessert",
              "Drinks",
            ].map((food) => (
              <label key={food} className="block mb-1 text-left">
                <input
                  type="checkbox"
                  value={food}
                  onChange={handleFoodChange}
                  className="mr-4 cursor-pointer w-5 h-5"
                />
                {food}
              </label>
            ))}
          </div>
          <div className="text-lg text-center  space-y-2">
            <h3 className="font-medium mb-2 text-lg">Occasion</h3>
            {[
              "Valentine's day",
              "Birthday",
              "Khmer Pchum ben",
              "Luna New Year",
            ].map((occasion) => (
              <label key={occasion} className="block mb-1 text-left">
                <input
                  type="checkbox"
                  value={occasion}
                  onChange={handleOccasionChange}
                  className="mr-2 cursor-pointer w-5 h-5"
                />
                {occasion}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-2 text-lg">Category</h3>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a category</option>
            <option value="Appetizer">Appetizer</option>
            <option value="Main Course">Main Course</option>
            <option value="Dessert">Dessert</option>
            {/* Add more categories as needed */}
          </select>
        </div>

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
