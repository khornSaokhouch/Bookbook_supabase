"use client";

import type React from "react";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Search, Bookmark, Plus } from "lucide-react";
import type { User } from "@/app/types";

type Category = {
  category_id: number;
  category_name: string;
};

type NavbarProps = {
  user: User | null;
};

export default function Navbar({ user }: NavbarProps) {
  const [imageUrl, setImageUrl] = useState<string>("/default-avatar.png");
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentCategoryName, setCurrentCategoryName] = useState<string | null>(
    null
  );

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      router.push(
        `/${user?.user_id}/search?query=${encodeURIComponent(searchTerm)}`
      );
    }
  };

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
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("image-user")
            .createSignedUrl(imageUrl, 60 * 60);

        if (signedUrlError || !signedUrlData?.signedUrl) {
          console.error("Error generating signed URL:", signedUrlError);
          return {
            user_name: data?.user_name || "User",
            image_url: "/default-avatar.png",
          };
        }

        return {
          user_name: data?.user_name || "User",
          image_url: signedUrlData.signedUrl,
        };
      }

      return {
        user_name: data?.user_name || "User",
        image_url: "/default-avatar.png",
      };
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return {
        user_name: "User",
        image_url: "/default-avatar.png",
      };
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    if (user?.user_id) {
      fetchUserProfile(user.user_id).then((profile) => {
        setImageUrl(profile.image_url);
        if (user) {
          user.user_name = profile.user_name;
        }
      });
    }
  }, [fetchCategories, fetchUserProfile, user]);

  useEffect(() => {
    const extractCategoryIdFromPath = () => {
      const match = pathname.match(/\/category\/(\d+)/);
      return match ? Number.parseInt(match[1], 10) : null;
    };

    const categoryId = extractCategoryIdFromPath();
    if (categoryId) {
      const category = categories.find((c) => c.category_id === categoryId);
      setCurrentCategoryName(category?.category_name || null);
    } else {
      setCurrentCategoryName(null);
    }
  }, [pathname, categories]);

  return (
    <div className="relative">
      {/* Main Navigation */}
      <nav className="relative bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-lg border-b border-gray-200/20 dark:border-gray-700/30 shadow-xl">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="group relative p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-700 dark:text-gray-300 relative z-10" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300 relative z-10" />
                )}
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-3 border border-gray-200/50 dark:border-gray-700/50 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Image
                    src="/logo.png"
                    alt="CookBook Logo"
                    width={50}
                    height={50}
                    className="w-10 h-10 md:w-12 md:h-12"
                  />
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { href: "/", label: "Home" },
                { href: `/${user?.user_id}/recipe`, label: "Recipe" },
                { href: `/${user?.user_id}/event`, label: "Events" },
                { href: "/about-us", label: "About Us" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="group relative px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 font-medium transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4 z-10" />
                  <input
                    type="text"
                    className="w-48 md:w-64 pl-11 pr-4 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                  />
                </div>
              </div>

              {/* Add Recipe Button */}
              <Link
                href={user ? `/${user?.user_id}/add-recipe` : "/login"}
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-purple-700"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    router.push("/login");
                  }
                }}
              >
                <Plus className="h-4 w-4" />
                <span>Add Recipe</span>
              </Link>

              {/* Profile Section */}
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    <Link
                      href={`/profile/${user.user_id}/save-recipe`}
                      className="group relative p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Bookmark className="h-4 w-4 text-gray-600 dark:text-gray-400 relative z-10" />
                    </Link>

                    <Link
                      href={`/profile/${user.user_id}/profile`}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <Image
                          src={imageUrl || "/placeholder.svg"}
                          alt={`Profile of ${user?.user_name || "User"}`}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full border-2 border-white/50 dark:border-gray-700/50 object-cover shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </Link>

                    <span className="hidden lg:block text-gray-700 dark:text-gray-300 font-medium">
                      {user.user_name}
                    </span>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-purple-700"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-t border-gray-200/20 dark:border-gray-700/30 shadow-xl">
            <div className="px-6 py-4 space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: `/${user?.user_id}/recipe`, label: "Recipe" },
                { href: `/${user?.user_id}/event`, label: "Events" },
                { href: "/about-us", label: "About Us" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href={user ? `/${user?.user_id}/add-recipe` : "/login"}
                className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg transition-all duration-300"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    router.push("/login");
                  }
                }}
              >
                <Plus className="h-4 w-4" />
                <span>Add Recipe</span>
              </Link>

              {!user && (
                <Link
                  href="/login"
                  className="block px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium text-center shadow-lg transition-all duration-300"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation (Categories) */}
      <div className="relative bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200/30 dark:border-gray-700/30 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-purple-600/3 to-pink-600/3"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 py-4 overflow-x-auto scrollbar-hide">
            {/* Static Links */}
            <Link
              href={`/${user?.user_id}/popular`}
              className="group relative px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Popular</span>
            </Link>

            <Link
              href={`/${user?.user_id}/occasion/`}
              className="group relative px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Occasion</span>
            </Link>

            {/* Dynamic Categories */}
            {categories.length === 0 ? (
              <div className="flex items-center space-x-2 px-4 py-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                  Loading...
                </span>
              </div>
            ) : (
              categories.map((category) => (
                <Link
                  key={category.category_id}
                  href={`/${user?.user_id}/category/${category.category_id}`}
                  className={`group relative px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${
                    currentCategoryName === category.category_name
                      ? "text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  {currentCategoryName !== category.category_name && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  <span className="relative z-10">
                    {category.category_name}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
