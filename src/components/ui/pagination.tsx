import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { Button } from "./button";

const Pagination = () => {
  const currentPage = 1;
  const totalPages = 5; // Example total pages
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center space-x-1 mt-8">
      {/* Previous Button (Optional) */}
      {/* <button className="px-3 py-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50" disabled={currentPage === 1}>Prev</button> */}

      {pages.map((page) => (
        <Button
          key={page}
          className={`px-3 py-1 border border-gray-100 rounded ${
            currentPage === page
              ? "bg-blue-600 text-white border-blue-600"
              : "text-gray-700 bg-gray-100 hover:bg-gray-300"
          }`}
        >
          {page}
        </Button>
      ))}

      <Button className="px-3 py-1 border border-gray-100 rounded text-gray-700 bg-gray-100 hover:bg-gray-300 flex items-center">
        Next <FaArrowRight className="ml-1.5" size={12} />
      </Button>
    </nav>
  );
};

export default Pagination;
