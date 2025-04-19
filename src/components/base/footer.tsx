import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaPaperPlane, FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Subscribe */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Subscribe</h3>
            <p className="text-sm mb-4">Subscribe to our newsletter</p>
            <form className="flex items-center border border-gray-600 rounded overflow-hidden">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent px-3 py-2 text-sm flex-grow focus:outline-none text-white placeholder-gray-500"
              />
              <button type="submit" className="text-gray-400 px-3 hover:text-white">
                <FaPaperPlane />
              </button>
            </form>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <address className="text-sm not-italic space-y-2">
              <p>No 24D, Green Bay Estate, Lekki, Lagos State, Nigeria</p>
              <p>
                <a href="mailto:support@checkaroundme.com" className="hover:text-white hover:underline">
                  support@checkaroundme.com
                </a>
              </p>
              <p>
                <a href="tel:+2349159558854" className="hover:text-white hover:underline">
                  +234 915 955 8854
                </a>
              </p>
            </address>
          </div>

          {/* Account */}
          {/* <div>
            <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/messages" className="hover:text-white hover:underline">My Messages</Link></li>
              <li><Link href="/login" className="hover:text-white hover:underline">Login / Register</Link></li>
            </ul>
          </div> */}

          {/* Quick Link */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Link</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-white hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white hover:underline">Terms Of Service</Link></li>
              <li><Link href="/about-us" className="hover:text-white hover:underline">About Us</Link></li>
              <li><Link href="/contact-us" className="hover:text-white hover:underline">Contact Us</Link></li>
            </ul>
          </div>

          {/* Invite a User */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Invite a User</h3>
            {/* Replace with actual QR code image */}
            <div className="mb-4 bg-white p-1 inline-block rounded">
              <Image
                src="/qr-code-placeholder.png" // Replace
                alt="QR Code"
                width={80}
                height={80}
              />
            </div>
            <div className="flex space-x-4">
              <a href="https://facebook.com/checkaroundme" aria-label="Facebook" className="text-gray-400 hover:text-white"><FaFacebookF size={18} /></a>
              <a href="https://x.com/checkaroundme" aria-label="Twitter" className="text-gray-400 hover:text-white"><FaTwitter size={18} /></a>
              <a href="https://instagram.com/checkaroundme" aria-label="Instagram" className="text-gray-400 hover:text-white"><FaInstagram size={18} /></a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          © Copyright checkaroundme 2025. All right reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;