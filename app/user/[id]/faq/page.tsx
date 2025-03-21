"use client";
import { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const questions = [
        {
            question: "How do I search for a recipe?",
            answer: "You can search for recipes by ingredient, cuisine, or meal type using the search bar at the top of the website. Just type in your keyword and explore the results!"
        },
        {
            question: "Can I save my favorite recipes?",
            answer: "Yes! You can create an account and save your favorite recipes by clicking the button on each recipe page. These will be stored in your profile for easy access."
        },
        {
            question: "Are the recipes on this website free to use?",
            answer: "Yes, all the recipes on our website are free to use! Feel free to browse, print, and try them out without any cost."
        },
        {
            question: "How do I submit my own recipe to the website?",
            answer: "You can submit your own recipes by visiting the Submit a Recipe page. Fill out the form with your recipe details and instructions, and we'll review it before posting it."
        },
        {
            question: "Are the recipes suitable for special dietary needs (e.g., gluten-free, vegan)?",
            answer: "Many of our recipes cater to special dietary needs. Each recipe includes a section highlighting dietary information, such as gluten-free, vegan, or nut-free options."
        },
        {
            question: "How do I print a recipe?",
            answer: "You can print any recipe by clicking the Print button found on each recipe page. This will generate a printer-friendly version of the recipe for you to use in the kitchen."
        },
        {
            question: "Can I leave a review for a recipe?",
            answer: "Yes! After trying a recipe, you can leave a review by scrolling to the bottom of the recipe page. We appreciate your feedback and love hearing about your cooking experiences!"
        }
    ];
    
    const toggleAnswer = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-2xl mx-auto bg-gray-300 p-5 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-center mb-5 text-black">Frequently Asked Questions</h2>
            {questions.map((item, index) => (
                <div key={index} className="border border-gray-300 rounded-lg mb-2 overflow-hidden">
                    <div 
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100" 
                        onClick={() => toggleAnswer(index)}
                    >
                        <span className="text-lg">{item.question}</span>
                        <span className="text-lg">
                            {openIndex === index ? (
                                <i className="fa-solid fa-chevron-up"></i>
                            ) : (
                                <i className="fa-solid fa-angle-down"></i>
                            )}
                        </span>
                    </div>
                    <div className={`px-4 bg-gray-100 transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <p>{item.answer}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FAQ;