import OccasionList from "../components/OccasionList";
import Navbar from "../components/Header";
import Footer from "../components/Footer";

const OccasionPage = () => {
  return (
    <div>
      <Navbar />
      <h1 className="text-center m-auto text-3xl">Occasion</h1>
      <OccasionList />
      <Footer />
    </div>
  );
};

export default OccasionPage;
