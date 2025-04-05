import React from 'react';
import { FaSlidersH, FaChevronDown } from 'react-icons/fa';
import { Button } from '@/components/ui/button'; // Use the reusable button

const FilterSortBar = () => {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          <FaSlidersH /> All
        </Button>
        <Button variant="outline" size="sm">
          Open Now
        </Button>
         <Button variant="outline" size="sm">
          Offers Delivery
        </Button>
        {/* Price dropdown placeholder */}
        {/* <Button variant="outline" size="sm"> Price <FaChevronDown className="ml-1" size={10} /></Button> */}

      </div>
      <div className="flex items-center">
        <span className="text-sm text-gray-600 mr-2">Sort:</span>
        <button className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
          Recommended
          <FaChevronDown className="ml-1" size={10} />
        </button>
      </div>
    </div>
  );
};

export default FilterSortBar;