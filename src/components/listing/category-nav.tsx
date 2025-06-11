import React, { useState, useEffect } from "react";
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
  Car,
  Sparkles,
  Truck,
  Wrench,
  Paintbrush,
  Sparkle, // New
  Layers, // New
  PartyPopper, // New
  Lightbulb, // New
  Hammer, // Changed from Toolbox
  Sprout, // New
  Bug, // New
  AirVent, // New
  GraduationCap, // New
  PawPrint, // New
  Camera, // New
  ChefHat, // New
  HardHat, // New
  Laptop, // New
  Activity, // New
} from "lucide-react";

type CategoryNavProps = {
  selectedCategory: string | null;
  onChangeCategory: (category: string | null) => void;
};

const CategoryIcon = ({
  category,
  size,
}: {
  category: string;
  size: number;
}) => {
  switch (category) {
    case "Cleaner":
      return <Sparkle size={size} />;
    case "Beauty & Spa":
      return <Sparkles size={size} />;
    case "Aluminum Fabricater":
      return <Layers size={size} />;
    case "Mechanic (Auto Repair)":
      return <Car size={size} />;
    case "Event Planner":
      return <PartyPopper size={size} />;
    case "Electrician":
      return <Lightbulb size={size} />;
    case "Plumber":
      return <Wrench size={size} />;
    case "Handyman":
      return <Hammer size={size} />;
    case "Painter":
      return <Paintbrush size={size} />;
    case "Landscaper / Gardener":
      return <Sprout size={size} />;
    case "Pest Control":
      return <Bug size={size} />;
    case "HV / AC":
      return <AirVent size={size} />;
    case "Tutor":
      return <GraduationCap size={size} />;
    case "Pet Groomer / Sitter":
      return <PawPrint size={size} />;
    case "Photographer":
      return <Camera size={size} />;
    case "Caterer":
      return <ChefHat size={size} />;
    case "Mover":
      return <Truck size={size} />;
    case "Home Renovator / Contractor":
      return <HardHat size={size} />;
    case "IT Support / Computer Repair":
      return <Laptop size={size} />;
    case "Personal Trainer / Fitness Instructor":
      return <Activity size={size} />;
    default:
      return <Ellipsis size={size} />;
  }
};

const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onChangeCategory,
}) => {
  const { data: categories = [], isLoading } = trpc.getAllCategories.useQuery(
    undefined,
    {
      staleTime: Infinity,
    }
  );
  const [displayCount, setDisplayCount] = useState(
    typeof window !== "undefined" ? (window.innerWidth < 768 ? 3 : 4) : 3
  );

  useEffect(() => {
    const handleResize = () => {
      setDisplayCount(window.innerWidth < 768 ? 3 : 4);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle single-select category
  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      onChangeCategory(null);
    } else {
      onChangeCategory(categoryName);
    }
  };

  return (
    <nav className="container bg-white border-b border-gray-200 py-3">
      <div className="w-screen mx-auto flex items-center justify-around md:justify-center">
        <div className="flex justify-evenly items-center space-x-2 md:space-x-3 overflow-x-auto whitespace-nowrap hide-scrollbar">
          {categories.slice(0, displayCount).map((category) => {
            const isSelected = selectedCategory === category.name;
            return (
              <button
                type="button"
                key={category.$id}
                onClick={() => handleCategoryClick(category.name)}
                className={`flex flex-shrink-0 items-center space-x-1.5 px-3 py-1.5 rounded-full border transition
                  ${
                    isSelected
                      ? "bg-blue-100 text-blue-700 border-blue-400 font-semibold"
                      : "text-gray-600 hover:text-blue-600 border-transparent hover:bg-gray-100"
                  }`}
                aria-pressed={isSelected}
              >
                <CategoryIcon category={category.name} size={14} />
                <span className="text-xs sm:text-sm">{category.name}</span>
              </button>
            );
          })}
        </div>

        {categories.length > 4 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-shrink-0 items-center space-x-1.5 px-3 py-1.5 text-gray-600 hover:text-blue-600 rounded-full border border-transparent hover:bg-gray-100 transition">
                <span className="text-xs sm:text-sm">More</span>
                <FaChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories.slice(displayCount).map((category) => (
                <DropdownMenuItem
                  key={category.$id}
                  onSelect={() => handleCategoryClick(category.name)}
                  className={`flex items-center space-x-2 ${
                    selectedCategory === category.name
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : ""
                  }`}
                >
                  <CategoryIcon category={category.name} size={14} />
                  <span className="text-xs sm:text-sm">{category.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

// Add display name for debugging
CategoryNav.displayName = "CategoryNav";

export default CategoryNav;
