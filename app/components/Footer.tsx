// components/Footer.tsx
import Link from 'next/link';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-container px-8 sm:px-20 py-[50px] border-t-2 border-b-2 border-blue-300 mb-6">
      <div className="container mx-auto flex flex-wrap justify-between">
        {/* Footer Menu */}
        <div className="footer-menu flex flex-col items-start mb-8 sm:mb-0">
          <ul className="flex flex-wrap list-none text-base">
            <li className="px-6">
              <Link href="/user/about-us" className="hover:text-blue-600">ABOUT US</Link>
            </li>
            <li className="px-6">
              <Link href="/user/contact-us" className="hover:text-blue-600">CONTACT US</Link>
            </li>
            <li className="px-6">
              <Link href="/faq" className="hover:text-blue-600">FAQ</Link>
            </li>
            <li className="px-6">
              <Link href="#" className="hover:text-blue-600">PRIVACY POLICY</Link>
            </li>
            <li className="px-6">
              <Link href="#" className="hover:text-blue-600">DISCLAIMER</Link>
            </li>
          </ul>
          <div className="logo-footer mt-4">
            <img src="/logo.png" alt="Logo" className="w-[100px] sm:w-[150px] mx-auto sm:ml-20" />
          </div>
        </div>

        {/* Footer Info */}
        <div className="footer-info flex flex-col items-start">
          <div className="contact flex items-center mb-4">
            <i className="fa-solid fa-location-dot text-blue-600 pr-2"></i>
            <span>Royal University Of Phnom Penh, Faculty Engineering, Department ITE</span>
          </div>
          <div className="contact flex items-center mb-4">
            <i className="fa-solid fa-phone text-blue-600 pr-2"></i>
            <span>(855) 456-7890</span>
          </div>
          <div className="social-media flex items-center">
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
