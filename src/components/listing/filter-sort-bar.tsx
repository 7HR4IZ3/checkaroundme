import React from "react";
import { FaSlidersH, FaChevronDown } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

type FilterSortBarProps = {
  selectedCategories: string[];
  onChangeCategories: (categories: string[]) => void;
  onOpenFiltersPanel: () => void;
};

const CATEGORIES = [
  { label: "Open Now", value: "open_now" },
  { label: "Offers Delivery", value: "offers_delivery" },
];

const FilterSortBar: React.FC<FilterSortBarProps> = ({
  selectedCategories,
  onChangeCategories,
  onOpenFiltersPanel,
}) => {
  const [sortBy, setSortBy] = React.useState("recommended");

  const handleCategoryClick = (value: string) => {
    if (value === 'price_low_to_high' || value === 'price_high_to_low') {
      onChangeCategories([value]); // Price sort is exclusive
      return;
    }

    const isSelected = selectedCategories.includes(value);
    if (isSelected) {
      onChangeCategories(selectedCategories.filter((cat) => cat !== value));
    } else {
      onChangeCategories([...selectedCategories, value]);
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={onOpenFiltersPanel} // All categories
        >
          <FaSlidersH className="mr-2" size={16} />
          All
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full">
              Price <FaChevronDown className="ml-1" size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={() => handleCategoryClick('price_low_to_high')}>Price: Low to High</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCategoryClick('price_high_to_low')}>Price: High to Low</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategories.includes(cat.value) ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => handleCategoryClick(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Location: Lagos, Ikeja <FaChevronDown className="ml-1" size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="p-2 text-sm font-bold text-gray-700">LOCATION FILTER</div>
            <DropdownMenuItem>Abuja FCT</DropdownMenuItem>
            <DropdownMenuItem>Ibadan</DropdownMenuItem>
            <DropdownMenuItem>Lagos</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-sm text-gray-600 mx-2">Sort:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Recommended
              <FaChevronDown className="ml-1" size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={() => setSortBy("recommended")}>Recommended</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("price")}>Price</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("distance")}>Distance</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default FilterSortBar;
