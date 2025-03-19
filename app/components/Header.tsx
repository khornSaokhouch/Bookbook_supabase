"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';

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

export default function Header() {
    const [user, setUser] = useState<User | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("/default-avatar.png");
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchUserProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("user_id, user_name, email, about_me, image_url")
                .eq("user_id", userId)
                .single();

            if (error) {
                console.error("❌ Error fetching user profile:", error.message);
                return null;
            }

            if (!data) {
                console.warn("⚠️ User profile not found for ID:", userId);
                return null;
            }

            return data as UserProfile;
        } catch (error: any) {
            console.error("❌ Error in fetchUserProfile function:", error.message);
            return null;
        }
    }, []);

    const fetchSignedImageUrl = useCallback(async (imagePath: string) => {
        try {
            const { data: signedUrlData, error: urlError } = await supabase.storage
                .from("image_url")
                .createSignedUrl(imagePath, 60);

            if (urlError) {
                console.error("❌ Error generating signed URL:", urlError.message);
                return "/default-avatar.png";
            }

            return signedUrlData?.signedUrl || "/default-avatar.png";
        } catch (signedUrlError: any) {
            console.error("❌ Error generating signed URL:", signedUrlError.message);
            return "/default-avatar.png";
        }
    }, []);

    const loadUser = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data: { user: authUser }, error: sessionError } = await supabase.auth.getUser();

            if (sessionError) {
                console.error("❌ Error fetching session:", sessionError.message);
                return;
            }

            if (authUser) {
                const profile = await fetchUserProfile(authUser.id);

                if (profile) {
                    setUser({ user_id: authUser.id, user_name: profile.user_name });
                    if (profile.image_url) {
                        const signedUrl = await fetchSignedImageUrl(profile.image_url);
                        setImageUrl(signedUrl);
                    } else {
                        setImageUrl("/default-avatar.png");
                    }
                } else {
                    setImageUrl("/default-avatar.png");
                }
            } else {
                console.log("🚨 No active session. Please log in.");
                setImageUrl("/default-avatar.png");
                setUser(null); // Ensure user is null when no active session
            }
        } catch (error: any) {
            console.error("❌ Error during user loading:", error.message);
            setImageUrl("/default-avatar.png");
        } finally {
            setIsLoading(false);
        }
    }, [fetchSignedImageUrl, fetchUserProfile]);


    useEffect(() => {
        // This listens for any authentication event
        supabase.auth.onAuthStateChange((event, session) => {
          console.log(`Supabase auth event: ${event}`, session)
          if (event === 'INITIAL_SESSION') {
            loadUser();
          }
          if (session && session.user) {
            loadUser();
          } else {
            setUser(null);
            setImageUrl("/default-avatar.png");
            setIsLoading(false);
          }
        });
    
      }, [loadUser]);


    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error.message);
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error('An error occurred during sign out:', error);
        }
    };

    return (
        <div>
            <nav className="shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-[110px]">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <Image
                                    src="/logo.png"
                                    alt="CookBook Logo"
                                    width={50}
                                    height={50}
                                    className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] object-contain"
                                />
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex space-x-10 text-lg">
                            <Link
                                href="/"
                                className="text-gray-600 hover:text-blue-600 font-medium"
                            >
                                Home
                            </Link>
                            <Link
                                href="/user/recipe"
                                className="text-gray-600 hover:text-blue-600 font-medium"
                            >
                                Recipe
                            </Link>
                            <Link
                                href="/user/about-us"
                                className="text-gray-600 hover:text-blue-600 font-medium"
                            >
                                About Us
                            </Link>
                        </div>

                        {/* Right Section (Search, Add Recipe, Profile) */}
                        <div className="flex items-center space-x-20">
                            {/* Search Bar */}
                            <input
                                type="text"
                                className="border border-gray-500 rounded-full pl-4 pr-10 py-3 text-sm"
                                placeholder="Search by name"
                            />

                            {/* Add Recipe Link */}
                            <Link
                                href={"/add-recipe"}
                                className="text-lg font-medium text-blue-600 hover:text-blue-800"
                            >
                                + Add a Recipe
                            </Link>

                            {/* Profile Section */}
                            <div className="flex items-center space-x-4">
                                {isLoading ? (
                                    <span>Loading...</span>
                                ) : user ? (
                                    <>
                                        <Link
                                            href="/profile/save-recipe"
                                            className="hover:text-gray-700"
                                        >
                                            <span className="material-icons text-gray-600 w-5 h-5">
                                                bookmark_border
                                            </span>
                                        </Link>
                                        <Link href={`/profile/${user.user_id}`}>
    <Image
        src={imageUrl || "/default-avatar.png"}
        alt={`Profile of ${user?.user_name || 'User'}`}
        width={40}
        height={40}
        className="w-10 h-10 rounded-full border border-gray-300 object-cover"
    />
                                        </Link>
                                        <span>{user.user_name}</span>
                                        <button onClick={handleSignOut} className="text-blue-500 hover:text-blue-700">
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="bg-blue-500 text-white px-4 py-2 rounded-full text-lg hover:bg-blue-600 transition"
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Secondary Navigation */}
            <div className="text-lg">
                <ul className="space-x-10 ml-[180px] py-4">
                    <Link
                        href="/user/event"
                        className="text-gray-600 hover:text-blue-600 font-medium"
                    >
                        Event
                    </Link>
                    <Link
                        href="/user/popular"
                        className="text-gray-600 hover:text-blue-600 font-medium"
                    >
                        Popular
                    </Link>
                    <Link
                        href="/soup"
                        className="text-gray-600 hover:text-blue-600 font-medium"
                    >
                        Soup
                    </Link>
                    <Link
                        href="/stir-frieds"
                        className="text-gray-600 hover:text-blue-600 font-medium"
                    >
                        Stir Frieds
                    </Link>
                    <Link
                        href="/occasion"
                        className="text-gray-600 hover:text-blue-600 font-medium"
                    >
                        Occasions
                    </Link>
                    <Link
                        href="/drinks"
                        className="text-gray-600 hover:text-blue-600 font-medium"
                    >
                        Drinks
                    </Link>
                    <Link
                        href="/dessert"
                        className="text-gray-600 hover:text-blue-600 font-medium"
                    >
                        Dessert
                    </Link>
                </ul>
            </div>
        </div>
    );
}