// app/[id]/page.tsx
"use client";

import DetailsPage from "../../components/DetailsPage"; // Adjust the path
import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const RecipeDetails = () => {
  return (
    <div>
      <Navbar />
      <DetailsPage />
      <Footer />
    </div>
  );
};

export default RecipeDetails;
