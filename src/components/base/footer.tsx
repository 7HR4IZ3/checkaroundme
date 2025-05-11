"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaPaperPlane,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import { toast } from "sonner";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(""); // Clear previous messages

    if (!email) {
      setMessage("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/mailing-list/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Successfully subscribed!");
        setEmail("");
        setMessage(result.message || "Successfully subscribed!"); // Also set local message
      } else {
        toast.error(result.error || "Subscription failed. Please try again.");
        setMessage(result.error || "Subscription failed. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-black text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          {/* Subscribe */}
          <div>
            <h3 className="text-lg font-semibold text-white dark:text-black mb-4">
              Subscribe
            </h3>
            <p className="text-sm mb-4">Subscribe to our newsletter</p>
            <form
              onSubmit={handleSubmit}
              className="flex items-center border border-gray-600 rounded overflow-hidden"
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-transparent px-3 py-2 text-sm flex-grow focus:outline-none text-white dark:text-black placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="text-gray-400 px-3 hover:text-white dark:text-black disabled:opacity-50"
              >
                {isLoading ? "..." : <FaPaperPlane />}
              </button>
            </form>
            {message && (
              <p
                className={`text-sm mt-2 ${
                  message.includes("Successfully")
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {message}
              </p>
            )}
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-white dark:text-black mb-4">
              Support
            </h3>
            {/* <address className="text-sm not-italic space-y-2">
              <p>No 24D, Green Bay Estate, Lekki, Lagos State, Nigeria</p>
              <p>
                <a href="mailto:support@checkaroundme.com" className="hover:text-white dark:text-black hover:underline">
                  support@checkaroundme.com
                </a>
              </p>
              <p>
                <a href="tel:+2349159558854" className="hover:text-white dark:text-black hover:underline">
                  +234 915 955 8854
                </a>
              </p>
            </address> */}
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about-us"
                  className="hover:text-white dark:text-black hover:underline"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="hover:text-white dark:text-black hover:underline"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          {/* <div>
            <h3 className="text-lg font-semibold text-white dark:text-black mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/messages" className="hover:text-white dark:text-black hover:underline">My Messages</Link></li>
              <li><Link href="/login" className="hover:text-white dark:text-black hover:underline">Login / Register</Link></li>
            </ul>
          </div> */}

          {/* Quick Link */}
          <div>
            <h3 className="text-lg font-semibold text-white dark:text-black mb-4">
              Quick Link
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-white dark:text-black hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="hover:text-white dark:text-black hover:underline"
                >
                  Terms Of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Invite a User */}
          <div>
            <h3 className="text-lg font-semibold text-white dark:text-black mb-4">
              Invite a User
            </h3>
            {/* Replace with actual QR code image */}
            <div className="mb-4 bg-white p-1 inline-block rounded">
              <Image
                src="/images/qr.png" // Replace
                alt="QR Code"
                width={80}
                height={80}
              />
            </div>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/checkaroundme"
                aria-label="Facebook"
                className="text-gray-400 hover:text-white dark:text-black"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href="https://x.com/checkaroundme"
                aria-label="Twitter"
                className="text-gray-400 hover:text-white dark:text-black"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="https://instagram.com/checkaroundme"
                aria-label="Instagram"
                className="text-gray-400 hover:text-white dark:text-black"
              >
                <FaInstagram size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          © Copyright checkaroundme 2023. All right reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
