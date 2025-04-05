import React from 'react';
import Link from 'next/link';
import { FaCar, FaWrench, FaCut, FaBolt, FaEllipsisH, FaChevronDown } from 'react-icons/fa';

const categories = [
  { name: 'Auto Mechanics', icon: FaCar, href: '/search/auto-mechanics', active: true },
  { name: 'Plumbers', icon: FaWrench, href: '/search/plumbers' },
  { name: 'Barber/Hair Dresser', icon: FaCut, href: '/search/barbers' },
  { name: 'Electrician', icon: FaBolt, href: '/search/electricians' },
];

const CategoryNav = () => {
  return (
    <nav className="bg-white border-b border-gray-200 py-3">
      <div className="container mx-auto px-4 flex items-center justify-center space-x-8">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className={`flex items-center space-x-2 pb-3 ${
              category.active
                ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <category.icon size={18} />
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