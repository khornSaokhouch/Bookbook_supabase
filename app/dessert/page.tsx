// pages/drinks.tsx (or wherever you want to display the drinks)
import DessertList from "../components/DessertList";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const DessertPage = () => {
  return (
    <div>
      <Navbar />
      <h1 className="text-center m-auto text-3xl">Dessert</h1>
      <DessertList />
      <Footer />
    </div>
  );
};

export default DessertPage;
