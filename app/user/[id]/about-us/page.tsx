"use client";

import Image from "next/image";
import "@fortawesome/fontawesome-free/css/all.min.css";

const AboutUs = () => {
  return (
    <div >
      {/* Hero Section */}
      <section className="text-center py-12 bg-gray-200 text-black px-5 rounded-lg">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm">About US</button>
        <h1 className="text-3xl font-bold mt-4">
          Welcome to <span className="text-black text-4xl">Book Cook</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto">
          where the joy of cooking meets the art of storytelling! Our passion is simple: we love food, and we believe that every meal tells a story.
        </p>
      </section>
      
  
{/* Team Section */}
<section className="text-center py-12">
  <h2 className="text-2xl font-bold">Our team member</h2>
  <p className="mt-2 mb-6">We aim to make cooking accessible and enjoyable for everyone, no matter your skill level.</p>
  
  <div className="flex flex-wrap justify-center gap-6">
    {/* Team Member 1 */}
    <div className="bg-white shadow-lg rounded-lg overflow-hidden w-72 text-center p-6">
      <Image src="/vibol.png" alt="Sen Vibol" width={250} height={250} className="rounded-full w-48 h-48 mx-auto object-cover border-4 border-blue-500" />
      <p className="mt-4 text-lg font-semibold">Mr. Sen Vibol</p>
      <div className="flex justify-center gap-3 mt-3">
        <a href="#" className="text-blue-600 text-xl"> <i className="fa-brands fa-facebook"></i> </a>
        <a href="#" className="text-blue-600 text-xl"><i className="fa-brands fa-telegram"></i></a>
        <a href="#" className="text-blue-600 text-xl"><i className="fa-brands fa-github"></i></a>
      </div>
    </div>
    
    {/* Team Member 2 */}
    <div className="bg-white shadow-lg rounded-lg overflow-hidden w-72 text-center p-6">
      <Image src="/khouch.png" alt="Khorn Soukhouch" width={250} height={250} className="rounded-full w-48 h-48 mx-auto object-cover border-4 border-blue-500" />
      <p className="mt-4 text-lg font-semibold">Mr. Khorn Soukhouch</p>
      <div className="flex justify-center gap-3 mt-3">
        <a href="#" className="text-blue-600 text-xl"><i className="fa-brands fa-facebook"></i></a>
        <a href="#" className="text-blue-600 text-xl"><i className="fa-brands fa-telegram"></i></a>
        <a href="#" className="text-blue-600 text-xl"><i className="fa-brands fa-github"></i></a>
      </div>
    </div>
    
    {/* Team Member 3 */}
    <div className="bg-white shadow-lg rounded-lg overflow-hidden w-72 text-center p-6">
      <Image src="/Nisa.png" alt="Sam Nisa" width={250} height={250} className="rounded-full w-48 h-48 mx-auto object-cover border-4 border-blue-500" />
      <p className="mt-4 text-lg font-semibold">Ms. Sam Nisa</p>
      <div className="flex justify-center gap-3 mt-3">
        <a href="#" className="text-blue-600 text-xl"><i className="fa-brands fa-facebook"></i></a>
        <a href="#" className="text-blue-600 text-xl"><i className="fa-brands fa-telegram"></i></a>
        <a href="#" className="text-blue-600 text-xl"><i className="fa-brands fa-github"></i></a>
      </div>
    </div>
  </div>
</section>

{/* About Us Section */}
<section className="bg-gray-200 rounded-lg py-12 px-6 text-center relative flex items-center">

  <div className="flex w-full">
    <div className="flex-1 pl-6">
      <h2 className="text-3xl text-purple-700 font-bold">Our Visions</h2>
      <p className="text-gray-700 mt-2 font-bold">What is our vision to do next?</p>
      <p className="max-w-2xl mx-auto mt-4 text-gray-700">
        Our team is made up of food enthusiasts, recipe developers, and culinary storytellers. We are committed to testing and refining every recipe, so you can be confident that when you cook with us, you’re making something truly special.
      </p>
      <div className="flex justify-center gap-4 mt-4 ">
        <a href="#" className="text-xl text-blue-700"><i className="fa-brands fa-telegram"></i></a>
        <a href="#" className="text-xl text-blue-700"><i className="fa-brands fa-facebook"></i></a>
        <a href="#" className="text-xl text-blue-700"><i className="fa-brands fa-github"></i></a>
        <a href="#" className="text-xl text-blue-700"><i className="fa-brands fa-youtube"></i></a>
      </div>
    </div>
  </div>
</section>


    </div>
  );
};

export default AboutUs;
