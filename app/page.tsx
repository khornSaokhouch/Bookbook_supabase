import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BannerSwiper from "./components/BannerSwiper";

export default function Home() {
  return (
    <div>
      <Navbar />

      <div className="m-auto py-10">
      <BannerSwiper />
    </div>
      
      <main className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold">Hello</h1>
        <p className="text-gray-600 mt-2">Welcome to my website!</p>
      </main>

      <Footer />
    </div>
  );
}
