const ContactUs = () => {
  return (
    <div className="bg-gray-100 p-8 rounded-lg shadow-lg max-w-6xl mx-auto">
      <h1 className="text-3xl text-center font-bold">Contact Us</h1>
      <p className="text-center mb-6">
        Any question or remarks? Just write us a message!
      </p>

      <div className="flex flex-col md:flex-row md:space-x-8 space-x-0">
        {/* Contact Information Section */}
        <div className="flex-1">
          <div className="bg-gray-200 rounded-lg mb-8 md:px-12 px-6 py-6">
            <h2 className="text-2xl font-semibold">Contact Information</h2>
            <p className="mt-2">Say something to start a live chat!</p>
            <p className="my-8">📞 +1012 3456 789</p>
            <p className="my-8">📧 demo@gmail.com</p>
            <p className="my-8">
              📍 Map data ©2024 Terms
              <br />
              Royal University of Phnom Penh
              <br />
              Penh4.5 (252) University
              <br />
              Open - Closes 5 pm
              <br />
              (110) - 023 883 640
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1">
          <form className="space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="First Name"
                required
                className="flex-1 border border-gray-300 p-3 rounded"
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                className="flex-1 border border-gray-300 p-3 rounded"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              required
              className="border border-gray-300 p-3 rounded w-full"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              required
              className="border border-gray-300 p-3 rounded w-full"
            />
            <textarea
              placeholder="Write your message..."
              required
              className="border border-gray-300 p-3 rounded w-full"
              rows="4"
            ></textarea>
            <button
              type="submit"
              className="bg-blue-600 p-3 rounded text-white w-full duration-300 hover:bg-blue-700 my-4 transition-all"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;