"use client";

import Hero from "@/components/home/hero";
import { useRouter } from "next/navigation";

const AboutUsPage = () => {
  const router = useRouter();

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
    </>
  );
};

export default AboutUsPage;
