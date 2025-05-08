"use client";

import Hero from "@/components/home/hero";
import { useRouter } from "next/navigation";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Users,
  Briefcase,
  MousePointer,
  ShieldCheck,
  HeartHandshake,
  Clock,
  Lock,
  Lightbulb,
  UserPlus,
  HelpCircle,
} from "lucide-react";

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
    <main className="">
      <Hero
        title="About Checkaroundme"
        subtitles={["Learn more about our company and mission"]}
        button={{
          text: "Contact Us",
          onclick: () => router.push("/contact-us"),
        }}
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <section className="space-y-4">
          <p className="mt-4 mb-4 leading-relaxed text-center">
            Checkaroundme revolutionizes how people find and book services,
            recognizing that accessible services simplify life. Our platform
            enables seamless connections between professional service providers
            and clients, allowing users to effortlessly locate and hire services
            in their area.
          </p>
          <p className="mt-2 mb-4 leading-relaxed text-center">
            At Checkaroundme, we believe in the power of flexibility and
            freedom. Our mission is to transform how people connect with
            professional services by creating a digital platform that
            facilitates easy and real-time access to affordable, high-quality,
            and reliable services. We aim to empower both service providers and
            seekers by simplifying the process of finding and offering services,
            making the experience seamless and convenient.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
            <Users className="mr-3 h-8 w-8" /> Who We Are
          </h2>
          <p className="mt-4 mb-4 leading-relaxed text-center">
            Founded in the year 2020, Checkaroundme was built with the vision of
            transforming the traditional job market. We are a diverse team of
            innovators, dedicated to creating a platform that bridges the gap
            between service providers and service seekers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
            <Briefcase className="mr-3 h-8 w-8" /> What We Do
          </h2>
          <p className="mt-4 mb-4 leading-relaxed text-center">
            We provide a dynamic marketplace where freelancers and potential
            clients can find each other easily. Our platform offers a wide range
            of opportunities across various industries, from creative services
            and tech support to event staffing and delivery.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Why Choose Us</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-8">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center">
                  <MousePointer className="mr-2 h-6 w-6" /> User-Friendly
                  Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="leading-relaxed text-center">
                  Our intuitive interface makes it simple to become a freelancer
                  and also post your skills.
                </p>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center">
                  <ShieldCheck className="mr-2 h-6 w-6" /> Quality Assurance
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="leading-relaxed text-center">
                  We vet our freelancers to ensure they meet high standards,
                  giving services seekers peace of mind when hiring through our
                  platform.
                </p>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center">
                  <HeartHandshake className="mr-2 h-6 w-6" /> Supportive
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="leading-relaxed text-center">
                  We foster a supportive environment where workers can grow
                  their careers, connect with peers, and access valuable
                  resources.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Values</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-8">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center">
                  <Clock className="mr-2 h-6 w-6" /> Flexibility
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="leading-relaxed text-center">
                  We champion the economy because we believe work should fit
                  around life.
                </p>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center">
                  <Lock className="mr-2 h-6 w-6" /> Trust
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="leading-relaxed text-center">
                  Building a trustworthy platform is paramount. We ensure
                  transparency is observed.
                </p>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center">
                  <Lightbulb className="mr-2 h-6 w-6" /> Innovation
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="leading-relaxed text-center">
                  Continuously improving and adapting to the changing work
                  landscape keeps us at the forefront of the economy.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center">
            <UserPlus className="mr-3 h-8 w-8" /> Join Us
          </h2>
          <p className="mt-4 mb-4 leading-relaxed text-center">
            Whether you're looking to hire, book or become a merchant,
            Checkaroundme is here to help you succeed. Join our growing
            community and be part of the future of service.
          </p>
          <div className="flex justify-center mt-8">
            <Button size="lg" onClick={() => router.push("/auth")}>
              Get Started
            </Button>
          </div>
        </section>

        <section id="faq">
          <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center">
            <HelpCircle className="mr-3 h-8 w-8" />
            Frequently Asked Questions
          </h2>
          <p className="text-md text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Find answers to common questions.
          </p>
          <div className="grid gap-6 max-w-2xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <HelpCircle className="mr-2 h-5 w-5 text-primary" />{" "}
                  {faq.question}
                </h3>
                <p className="text-muted-foreground text-base">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AboutUsPage;
