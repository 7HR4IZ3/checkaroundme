import React from "react";
import { FaSlidersH, FaChevronDown } from "react-icons/fa";
import { Button } from "@/components/ui/button";

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
  const handleCategoryClick = (value: string) => {
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
        <Button variant="outline" size="sm" onClick={onOpenFiltersPanel}>
          <FaSlidersH /> Filters
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={selectedCategories.includes(cat.value) ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center">
        <span className="text-sm text-gray-600 mr-2">Sort:</span>
        <button className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600" type="button">
          Recommended
          <FaChevronDown className="ml-1" size={10} />
        </button>
      </div>
    </div>
  );
};

export default FilterSortBar;
