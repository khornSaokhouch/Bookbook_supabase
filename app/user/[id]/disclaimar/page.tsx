"use client";
import React from "react";

const Disclaimer = () => {
    return (
        <div className="bg-white">
            <div className="bg-blue-600 py-16 rounded-t-lg">
                <h2 className="text-3xl font-bold text-center text-white">Disclaimer</h2>
            </div>
            <div className="max-w-2xl mx-auto p-6">
                <h3 className="text-2xl font-bold text-black">Disclaimer</h3>
                <p className="text-gray-700 text-lg leading-relaxed mt-4">
                    Disclaimer: The recipes, ingredients, and cooking tips provided on this website are intended for informational and educational purposes only. While we make every effort to ensure the accuracy, completeness, and reliability of the information presented, we cannot guarantee that your results will match those described. Cooking involves various factors, including individual skill levels, equipment, and ingredient availability, which may affect the outcome of each recipe.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed mt-4">
                    Additionally, please be aware of any food allergies, sensitivities, or dietary restrictions you or your guests may have before preparing any dishes. We recommend consulting with a healthcare professional or nutritionist for personalized dietary advice.
                </p>
            </div>
        </div>
    );
};

export default Disclaimer;