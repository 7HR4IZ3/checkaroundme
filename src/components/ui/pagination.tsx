import React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Button } from "./button";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center space-x-1 mt-8">
      <Button
        className="px-3 py-1 border border-gray-100 rounded text-gray-700 bg-gray-100 hover:bg-gray-300 flex items-center"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <FaArrowLeft className="ml-1.5" size={12} /> Prev
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          className={`px-3 py-1 rounded ${
            currentPage === page
              ? "bg-primary text-white dark:text-black border border-primary"
              : "text-gray-700 bg-gray-100 hover:bg-gray-300"
          }`}
          onClick={() => onPageChange(page)}
          aria-current={currentPage === page ? "page" : undefined}
        >
          {page}
        </Button>
      ))}

      <Button
        className="px-3 py-1 border border-gray-100 rounded text-gray-700 bg-gray-100 hover:bg-gray-300 flex items-center"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next <FaArrowRight className="ml-1.5" size={12} />
      </Button>
    </nav>
  );
};

export default Pagination;
