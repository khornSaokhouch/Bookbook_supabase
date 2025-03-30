"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react"; // Added Menu and X icons

type User = {
  user_id: string;
  image_url?: string;
  user_name?: string;
};

type UserProfile = {
  user_id: string;
  user_name: string;
  email: string;
  about_me: string;
  image_url?: string;
};

type Category = {
  category_id: number;
  category_name: string;
};

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("/default-avatar.png");
  const [isLoading, setIsLoading] = useState(true);
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

/** Fetch user profile */
const fetchUserProfile = useCallback(async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("user_id, user_name, email, about_me, image_url")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data as UserProfile;
  } catch {
    console.error("Error fetching user profile");
    return null;
  }
}, []);


  /** Fetch signed image URL */
 /** Fetch signed image URL */
const fetchSignedImageUrl = useCallback(async (imagePath: string | undefined) => {
  if (!imagePath) return "/default-avatar.png";
  try {
    const { data, error } = await supabase.storage.from("image-user").createSignedUrl(imagePath, 60);
    if (error) return "/default-avatar.png";
    return data?.signedUrl || "/default-avatar.png";
  } catch {
    return "/default-avatar.png";
  }
}, []);


  /** Load user data */
  const loadUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        setImageUrl("/default-avatar.png");
        return;
      }

      const profile = await fetchUserProfile(authUser.id);
      if (profile) {
        setUser({ user_id: authUser.id, user_name: profile.user_name, image_url: profile.image_url });
        const signedUrl = await fetchSignedImageUrl(profile.image_url);
        setImageUrl(signedUrl);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchSignedImageUrl, fetchUserProfile]);

  useEffect(() => {
    fetchCategories();
    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || session) {
        loadUser();
      } else {
        setUser(null);
        setImageUrl("/default-avatar.png");
        setIsLoading(false);
      }
    });

    return () => authListener?.subscription.unsubscribe();
  }, [fetchCategories, loadUser]);

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
                <Image src="https://img.icons8.com/ios7/512/search.png" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" alt="Search icon" width={20} height={20} />
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
                {isLoading ? (
                  <span>Loading...</span>
                ) : user ? (
                  <>
                    <Link href={`/${user.user_id}/save-recipe`} className="hover:text-gray-700 dark:hover:text-gray-300">
                      <span className="material-icons text-gray-600 dark:text-gray-400 w-5 h-5">bookmark_border</span>
                    </Link>
                    <Link href={`/${user.user_id}/profile`}>
                      <Image src={imageUrl || "/default-avatar.png"} alt={`Profile of ${user?.user_name || "User"}`} width={40} height={40} className="w-15 h-15 rounded-full border border-gray-300 object-cover" />
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
            {user ? null : <Link href="/login" className="block py-2 text-lg bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition">Login</Link>}
          </div>
        )}
      </nav>

      {/* Secondary Navigation (Categories) */}
      <div className="text-lg">
        <ul className="flex flex-wrap justify-start lg:justify-start space-x-4 md:space-x-10 ml-4 md:ml-0 py-4 xl:pl-38">
          {categories.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Loading categories...</p>
          ) : (
            categories.map((category) => (
              <li key={category.category_id} className="mb-2 md:mb-0">
                <Link href={`/${category.category_id}/category`} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
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
