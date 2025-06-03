import Recipe from "@/app/components/Recipe";
import BannerSwiper from "@/app/components/BannerSwiper";

export default function RecipePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full ">
        <BannerSwiper />
      </div>

      {/* Centered Recipe Content */}
      <main className="container mx-auto px-4 py-6">
        <section>
          <Recipe />
        </section>
      </main>

    </main>
  );
}
