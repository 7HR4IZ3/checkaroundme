"use client";

import Hero from "@/components/home/hero";
import { useRouter } from "next/navigation";

const AboutUsPage = () => {
  const router = useRouter();

  const faqs = [
    {
      question: "How do I find services?",
      answer: "Use the search bar or browse categories.",
    },
    {
      question: "Is it free to use?",
      answer: "Yes, it's free for users to find and connect with services.",
    },
    {
      question: "How can I list my business?",
      answer: "Sign up as a business and create your profile.",
    },
  ];
  return (
    <>
      <Hero
        title="About Us"
        subtitles={["Learn more about our company and mission"]}
        button={{
          text: "Contact Us",
          onclick: () => router.push("/contact-us"),
        }}
      />
      <div className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Our Story</h2>
          <p>
            [Demo Data] Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p>
            [Demo Data] Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-bold mb-4">Our Team</h2>
          <p>
            [Demo Data] Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </section>
      </div>
      <section id="faq" className="py-12">
        <div>
          <h2 className="text-3xl font-bold text-center mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-md text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Find answers to common questions.
          </p>
          <div className="grid gap-6 max-w-2xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-1">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUsPage;
