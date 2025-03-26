import FriedList from "../components/FriedsList";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const FriedPage = () => {
  return (
    <div>
      <Navbar />
      <h1 className="text-center m-auto text-3xl">stir-frieds</h1>
      <FriedList />
      <Footer />
    </div>
  );
};

export default FriedPage;
