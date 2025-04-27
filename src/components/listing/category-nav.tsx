import React from "react";
import { FaChevronDown } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc/client";
import {
  Ellipsis,
  Utensils,
  Scissors,
  Dumbbell,
  Cake,
  Car,
  Home,
  Sparkles,
  Truck,
  Wrench,
  Sofa,
  Zap,
  Settings,
  Paintbrush,
  Sun,
  Hammer,
  Cookie,
  Shirt,
} from "lucide-react";

type CategoryNavProps = {
  selectedCategory: string | null;
  onChangeCategory: (category: string | null) => void;
};

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "Restaurant":
      return <Utensils size={16} />;
    case "Salon":
      return <Scissors size={16} />;
    case "Gym":
      return <Dumbbell size={16} />;
    case "Bakery":
      return <Cake size={16} />;
    case "Auto mobile mechanics":
      return <Car size={16} />;
    case "Housekeeping":
      return <Home size={16} />;
    case "Beauty and Spa":
      return <Sparkles size={16} />;
    case "Movers":
      return <Truck size={16} />;
    case "Plumber":
      return <Wrench size={16} />;
    case "Furniture":
      return <Sofa size={16} />;
    case "Appliances and repair":
      return <Zap size={16} />;
    case "Engineer":
      return <Settings size={16} />;
    case "Painter":
      return <Paintbrush size={16} />;
    case "Solar installer":
      return <Sun size={16} />;
    case "Welding and fabrication":
      return <Hammer size={16} />;
    case "Catering and baking":
      return <Cookie size={16} />;
    case "Fashion designer":
      return <Shirt size={16} />;
    default:
      return <Ellipsis size={16} />;
  }
};

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
                ${
                  isSelected
                    ? "bg-blue-100 text-blue-700 border-blue-400 font-semibold"
                    : "text-gray-600 hover:text-blue-600 border-transparent hover:bg-gray-100"
                }`}
              aria-pressed={isSelected}
            >
              <CategoryIcon category={category.name} />
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
                  className={`flex items-center space-x-2 ${
                    selectedCategory === category.name
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : ""
                  }`}
                >
                  <CategoryIcon category={category.name} />
                  <span>{category.name}</span>
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
