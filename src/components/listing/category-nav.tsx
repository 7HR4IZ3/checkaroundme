import React from 'react';
import Link from 'next/link';
import { FaEllipsisH, FaChevronDown } from 'react-icons/fa';
import { trpc } from "@/lib/trpc/client";


const CategoryNav = () => {
  const { data: categories = [] } = trpc.getAllCategories.useQuery();

  return (
    <nav className="bg-white border-b border-gray-200 py-3">
      <div className="container mx-auto px-4 flex items-center justify-center space-x-8">
        {categories.map((category) => (
          <Link
            key={category.$id}
            href={`/search/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`}
            className="flex items-center space-x-2 pb-3 text-gray-600 hover:text-blue-600"
          >
            <FaEllipsisH size={18} />
            <span>{category.name}</span>
          </Link>
        ))}
        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 pb-3">
           <span>More</span>
           <FaChevronDown size={12} />
        </button>
      </div>
    </nav>
  );
};

export default CategoryNav;