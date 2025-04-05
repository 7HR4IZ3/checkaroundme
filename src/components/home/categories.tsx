// components/Categories.js
'use client'; // Required for react-slick

import React from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../ui/carousel';

// Sample category data (replace with your actual data)
const categories = [
  { name: 'Auto Service Mechanic', image: '/images/cat-placeholder.png' },
  { name: 'Plumbers', image: '/images/cat-placeholder.png' },
  { name: 'Restaurants', image: '/images/cat-placeholder.png' },
  { name: 'Electricians', image: '/images/cat-placeholder.png' },
  { name: 'Cleaners', image: '/images/cat-placeholder.png' },
  { name: 'Movers', image: '/images/cat-placeholder.png' },
  { name: 'Painters', image: '/images/cat-placeholder.png' },
  { name: 'Handymen', image: '/images/cat-placeholder.png' },
];

const Categories = () => {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-center mb-8">Categories</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {categories.map((category, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4 lg:basis-1/5">
                <div className="flex flex-col items-center text-center cursor-pointer group">
                  <div className="w-50 h-50 sm:w-40 sm:h-40 rounded-full overflow-hidden border-3 border-red-500 transition duration-200">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={200}
                      height={200}
                      objectFit="cover"
                      className="w-full h-full"
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-700 group-hover:text-blue-600">{category.name}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </div>
  );
};

export default Categories;