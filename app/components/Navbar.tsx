"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react"; // Added Menu and X icons
import { User } from "@/app/types"; // Import shared User type

type Category = {
  category_id: number;
  category_name: string;
};

type NavbarProps = {
  user: User | null; // Use shared User type
};

export default function Navbar({ user }: NavbarProps) {
  const [imageUrl, setImageUrl] = useState<string>("/default-avatar.png");
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  

  /** Fetch categories from database */
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("category")
        .select("category_id, category_name")
        .order("category_id", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch {
      console.error("Error fetching categories");
    }
  }, []);

  /** Fetch user profile data (user_name and image_url) by user_id */
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_name, image_url")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      const imageUrl = data?.image_url;

      if (imageUrl) {
        // Generate a signed URL using the correct bucket name (image-user)
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("image-user")
          .createSignedUrl(imageUrl, 60 * 60); // URL valid for 1 hour

        if (signedUrlError || !signedUrlData?.signedUrl) {
          console.error("Error generating signed URL:", signedUrlError);
          return {
            user_name: data?.user_name || "User",
            image_url: "/default-avatar.png", // Fallback to default image
          };
        }

        return {
          user_name: data?.user_name || "User",
          image_url: signedUrlData.signedUrl,
        };
      }

      return {
        user_name: data?.user_name || "User",
        image_url: "/default-avatar.png", // Fallback if no image URL is found
      };
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return {
        user_name: "User",
        image_url: "/default-avatar.png", // Fallback to default image
      };
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    if (user?.user_id) {
      fetchUserProfile(user.user_id).then((profile) => {
        setImageUrl(profile.image_url);
        if (user) {
          user.user_name = profile.user_name; // Update user_name in the user object
        }
      });
    }
  }, [fetchCategories, fetchUserProfile, user]);

  return (
    <div>
      <nav className="shadow-md dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[110px]">

            {/* Mobile Menu Button (Moved to Left) */}
            <div className="order-1">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 focus:outline-none md:hidden"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Logo (Hidden on Small Screens) */}
            <div className="hidden md:flex items-center order-2">
              <Link href="/">
                <Image src="/logo.png" alt="CookBook Logo" width={50} height={50} className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] object-contain" />
              </Link>
            </div>

            {/* Navigation Links (Hidden on Small Screens) */}
            <div className="hidden md:flex space-x-10 text-lg order-3">
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Home</Link>
              <Link href={`/${user?.user_id}/recipe`} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Recipe</Link>
              <Link href={`/about-us`} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">About Us</Link>
            </div>

            {/* Right Section (Centered on Small Screens) */}
            <div className="flex items-center space-x-4 md:space-x-6 justify-center md:justify-start order-4">
              {/* Search Bar */}
              <div className="relative">
                <input type="text" className="border border-gray-500 rounded-full pl-10 pr-4 py-3 text-sm w-48 md:w-full" placeholder="Search by name" /> 
              </div>
              {/* Add Recipe Link */}
              <Link
                href={user ? `/${user?.user_id}/add-recipe` : "/login"}
                className="hidden md:inline-block text-lg font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800"
                onClick={(e) => { if (!user) { e.preventDefault(); router.push("/login"); } }}
              >
                + Add a Recipe
              </Link>

              {/* Profile Section */}
              <div className="flex items-center space-x-2 md:space-x-6">
                {user ? (
                  <>
                    <Link href={`/${user.user_id}/save-recipe`} className="group flex flex-col items-center">
                      <span className="material-icons text-gray-600 dark:text-gray-400 w-5 h-5 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                        bookmark_border
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Save
                      </span>
                    </Link>

                    <Link href={`/${user.user_id}/profile`}>
                      <Image
                        src={imageUrl}
                        alt={`Profile of ${user?.user_name || "User"}`}
                        width={40}
                        height={40}
                        className="w-15 h-15 rounded-full border border-gray-300 object-cover"
                      />
                    </Link>
                    <span className="hidden md:inline-block text-lg">{user.user_name}</span>
                  </>
                ) : (
                  <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded-full text-lg hover:bg-blue-600 transition">Login</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu (Conditional Rendering) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-100 dark:bg-gray-700 py-4 px-6">
            <Link href="/" className="block py-2 text-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <Link href={`/${user?.user_id}/recipe`} className="block py-2 text-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Recipe</Link>
            <Link href={`/about-us`} className="block py-2 text-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">About Us</Link>
            <Link href={user ? `/${user?.user_id}/add-recipe` : "/login"} className="block py-2 text-lg text-blue-600 dark:text-blue-400 hover:text-blue-800" onClick={(e) => { if (!user) { e.preventDefault(); router.push("/login"); } }}>+ Add a Recipe</Link>
            {user ? null : <Link href="/login" className="block py-2 text-lg bg-blue-500 text-white px-4 rounded-full hover:bg-blue-600 transition">Login</Link>}
          </div>
        )}
      </nav>

      {/* Secondary Navigation (Categories) */}
      <div className="text-lg">
  <ul className="flex flex-wrap justify-start lg:justify-start space-x-4 md:space-x-10 ml-4 md:ml-0 py-4 xl:pl-38">
    
    {/* Static Links - Inline with Categories */}
    <li className="mb-2 md:mb-0">
      <Link href={`/${user?.user_id}/popular`} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
        Populor
      </Link>
    </li>
    <li className="mb-2 md:mb-0">
      <Link href={`/${user?.user_id}/event`} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
        Events
      </Link>
    </li>

    {/* Dynamic Categories */}
    {categories.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-400">Loading categories...</p>
    ) : (
      categories.map((category) => (
        <li key={category.category_name} className="mb-2 md:mb-0">
          <Link
            href={`/${category.category_name}`}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
          >
            {category.category_name}
          </Link>
        </li>
      ))
    )}
  </ul>
</div>


    </div>
  );
}
