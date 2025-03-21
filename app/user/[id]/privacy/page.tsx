"use client";
import { useState } from "react";

const PrivacyPolicy = () => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="flex justify-center items-center  bg-gray-100">
            <div className="bg-white rounded-lg shadow-lg px-32 pt-2 flex">
                <div className="flex-1 p-4">
                    <h2 className="text-2xl font-bold mb-4">Privacy and policy</h2>
                    <p className="mb-4">
                        Your privacy is important to us. It is Brainstorming’s policy to respect your
                        privacy regarding any information we may collect from you across our
                        website, and other sites we own and operate.
                    </p>
                    <p className="mb-4">
                        We only ask for personal information when we truly need it to provide a
                        service to you. We collect it fair and lawful, with your knowledge and
                        consent. We also let you know why we’re collecting it and how it will be
                        used.
                    </p>
                    <p className="mb-4">
                        We only retain collected information for as long as necessary to provide you
                        with your requested service. What data we store, we’ll protect within
                        commercially acceptable means to prevent loss and theft, as well as
                        unauthorized access, disclosure, copying, use, or modification.
                    </p>
                    <p className="mb-4">
                        We don’t share any personally identifying information publicly or with third
                        parties, except when required to by law.
                    </p>
                    {/* <button
                        onClick={handleClose}
                        className="bg-blue-500 text-white px-4 py-2 my-2 rounded-lg mt-4"
                    >
                        I’ve agree with this
                    </button> */}
                </div>
                <div className="hidden md:block md:w-1/3">
                    <img
                        src="/privacy.png" // Replace with your image path
                        alt="Privacy Policy Illustration"
                        className="w-full h-auto"
                    />
                </div>
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-600"
                >
                    <i className="fa-solid fa-times fa-lg"></i>
                </button>
            </div>
        </div>
    );
};

export default PrivacyPolicy;