import SoupList from "../components/SoupList";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SoupPage = () => {
  return (
    <div>
      <Navbar />
      <h1 className="text-center m-auto text-3xl">Soup</h1>
      <SoupList />
      <Footer />
    </div>
  );
};

export default SoupPage;