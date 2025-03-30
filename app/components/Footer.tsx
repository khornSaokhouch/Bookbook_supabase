// components/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faLinkedin,
  faTwitter,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faLocationDot, faPhone } from "@fortawesome/free-solid-svg-icons";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
      <div className="container mx-auto px-24 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          {/* Footer Menu & Logo */}
          <div className="mb-6 md:mb-0">
            <nav className="flex flex-wrap justify-center md:justify-start">
              <Link
                href="/about-us"
                className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
              >
                About Us
              </Link>
              <Link
                href="/contact-us"
                className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Contact Us
              </Link>
              <Link
                href="/faq"
                className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
              >
                FAQ
              </Link>
              <Link
                href="/privacy"
                className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/disclaimer"
                className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Disclaimer
              </Link>
            </nav>
            <div className="mt-4 flex justify-center md:justify-start">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Your Logo"
                  width={120}
                  height={120}
                  priority
                />
              </Link>
            </div>
          </div>

          {/* Footer Info */}
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center md:text-right">
              © {new Date().getFullYear()} CookBook. All rights reserved.
            </p>
            <div className="mt-4 text-center md:text-right">
              <div className="mb-2 text-gray-600 dark:text-gray-300">
                <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-blue-500" />
                Royal University Of Phnom Penh, Faculty Engineering, Department ITE
              </div>
              <div className="mb-2 text-gray-600 dark:text-gray-300">
                <FontAwesomeIcon icon={faPhone} className="mr-2 text-blue-500" />
                (855) 456-7890
              </div>
              <div className="flex justify-center md:justify-end space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <FontAwesomeIcon icon={faFacebook} size="lg" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <FontAwesomeIcon icon={faLinkedin} size="lg" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <FontAwesomeIcon icon={faTwitter} size="lg" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <FontAwesomeIcon icon={faInstagram} size="lg" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                  aria-label="YouTube"
                >
                  <FontAwesomeIcon icon={faYoutube} size="lg" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;