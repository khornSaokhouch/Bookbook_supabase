// components/Footer.tsx
import Link from 'next/link';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-container px-4 sm:px-10 md:px-20 py-8 border-t-2 border-b-2 border-blue-300 mb-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center md:items-start">
        {/* Footer Menu */}
        <div className="footer-menu flex flex-col items-center md:items-start mb-8 md:mb-0 w-full md:w-1/2">
          <ul className="flex flex-wrap justify-center md:justify-start list-none text-base">
            <li className="px-2 md:px-4 py-1">
              <Link href="/user/${userId}/about-us" className="hover:text-blue-600">ABOUT US</Link>
            </li>
            <li className="px-2 md:px-4 py-1">
              <Link href="/user/${userId}/contact-us" className="hover:text-blue-600">CONTACT US</Link>
            </li>
            <li className="px-2 md:px-4 py-1">
              <Link href="/user/${userId}/faq" className="hover:text-blue-600">FAQ</Link>
            </li>
            <li className="px-2 md:px-4 py-1">
              <Link href="/user/${userId}/privacy" className="hover:text-blue-600">PRIVACY POLICY</Link>
            </li>
            <li className="px-2 md:px-4 py-1">
              <Link href="/user/${userId}/disclaimar" className="hover:text-blue-600">DISCLAIMER</Link>
            </li>
          </ul>
          <div className="logo-footer mt-4">
            <img src="/logo.png" alt="Logo" className="w-[80px] sm:w-[120px] md:w-[150px] mx-auto md:ml-0" /> {/*Center logo on small screens*/}
          </div>
        </div>

        {/* Footer Info */}
        <div className="footer-info flex flex-col items-center md:items-start w-full md:w-1/2 mt-8 md:mt-0">
          <div className="contact flex items-center mb-4 justify-center md:justify-start">
            <i className="fa-solid fa-location-dot text-blue-600 pr-2"></i>
            <span className="text-sm sm:text-base">Royal University Of Phnom Penh, Faculty Engineering, Department ITE</span>
          </div>
          <div className="contact flex items-center mb-4 justify-center md:justify-start">
            <i className="fa-solid fa-phone text-blue-600 pr-2"></i>
            <span className="text-sm sm:text-base">(855) 456-7890</span>
          </div>
          <div className="social-media flex items-center justify-center md:justify-start">
            <p className="text-lg pr-4">Follow Us:</p>
            <a href="#" target="_blank" className="text-blue-600 pr-4 text-xl">
              <i className="fa-brands fa-facebook"></i>
            </a>
            <a href="#" target="_blank" className="text-blue-600 pr-4 text-xl">
              <i className="fa-brands fa-linkedin"></i>
            </a>
            <a href="#" target="_blank" className="text-blue-600 pr-4 text-xl">
              <i className="fa-brands fa-twitter"></i>
            </a>
            <a href="#" target="_blank" className="text-blue-600 pr-4 text-xl">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="#" target="_blank" className="text-blue-600 text-xl">
              <i className="fa-brands fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;