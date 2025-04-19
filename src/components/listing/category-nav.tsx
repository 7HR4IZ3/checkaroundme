import React from 'react';
import { FaChevronDown, FaEllipsisH } from 'react-icons/fa';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc/client";
import { Ellipsis } from 'lucide-react';
import { BakeryIcon, GymIcon, ResturantIcon, SalonIcon } from './svg';

type CategoryNavProps = {
  selectedCategory: string | null;
  onChangeCategory: (category: string | null) => void;
};

// TODO: Change this hackish implementation!!
const CatergoryIcon = ({ category }: { category: string}) => {
  console.log(category)
  if (category === "Restaurant") return <ResturantIcon />
  if (category === "Salon") return <SalonIcon />
  if (category === "Gym") return <GymIcon />
  if (category === "Bakery") return <BakeryIcon />

  return <Ellipsis />;
}

const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onChangeCategory,
}) => {
  const { data: categories = [], isLoading } = trpc.getAllCategories.useQuery();

  // Handle single-select category
  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      onChangeCategory(null); // Deselect if already selected
    } else {
      onChangeCategory(categoryName);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-3">
      <div className="container mx-auto px-4 flex items-center justify-center space-x-4">
        {categories.slice(0, 5).map((category) => {
          const isSelected = selectedCategory === category.name;
          return (
            <button
              key={category.$id}
              type="button"
              onClick={() => handleCategoryClick(category.name)}
              className={`flex items-center space-x-2 p-2 px-3 rounded-full border transition
                ${isSelected
                  ? 'bg-blue-100 text-blue-700 border-blue-400 font-semibold'
                  : 'text-gray-600 hover:text-blue-600 border-transparent hover:bg-gray-100'
                }`}
              aria-pressed={isSelected}
            >
              <CatergoryIcon category={category.name} />
              <span>{category.name}</span>
            </button>
          );
        })}

        {categories.length > 5 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 p-2 px-3 rounded-full border border-transparent hover:bg-gray-100 transition">
                <span>More</span>
                <FaChevronDown size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories.slice(5).map((category) => (
                <DropdownMenuItem
                  key={category.$id}
                  onSelect={() => handleCategoryClick(category.name)}
                  className={selectedCategory === category.name ? "bg-blue-100 text-blue-700 font-semibold" : ""}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default CategoryNav;