"use client";

import type React from "react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Search, ShoppingBag, User, ChevronDown, X } from "lucide-react";
import { cn } from "../utils/utils";

const allTags = [
  { name: "Sneakers", href: "/tags/sneakers" },
  { name: "Running", href: "/tags/running" },
  { name: "Athletic", href: "/tags/athletic" },
  { name: "Boots", href: "/tags/boots" },
  { name: "Sandals", href: "/tags/sandals" },
  { name: "Heels", href: "/tags/heels" },
  { name: "Loafers", href: "/tags/loafers" },
  { name: "School Shoes", href: "/tags/school" },
  { name: "Sports", href: "/tags/sports" },
];
const allBrands = [
  { brandId: 101, name: "Nike", href: "/brands/101" },
  { brandId: 2, name: "Adidas", href: "/brands/2" },
  { brandId: 3, name: "New Balance", href: "/brands/3" },
  { brandId: 4, name: "Puma", href: "/brands/4" },
  { brandId: 5, name: "Converse", href: "/brands/5" },
  { brandId: 6, name: "Vans", href: "/brands/6" },
  { brandId: 7, name: "Reebok", href: "/brands/7" },
  { brandId: 8, name: "Under Armour", href: "/brands/8" },
];

const navItems = [
  { name: "HOME", href: "/" },
  // { name: "WOMEN", href: "/women" },
  // { name: "MEN", href: "/men" },
  // { name: "KIDS", href: "/kids" },
  {
    name: "TAGS",
    href: "/tags",
    subcategories: allTags,
  },
  {
    name: "BRANDS",
    href: "/brands",
    subcategories: allBrands,
  },
];

export default function NavigationBar() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<
    string | null
  >(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?name=${encodeURIComponent(searchQuery)}`);
      // Reset the search query after navigation
      setSearchQuery("");
    }
  };

  // Update the handleSearchInput function
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/search?name=${encodeURIComponent(query)}`);
    } else {
      navigate("/"); // Navigate to home page when search is empty
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setExpandedMobileCategory(null);
    }
  };

  const toggleMobileCategory = (categoryName: string) => {
    if (expandedMobileCategory === categoryName) {
      setExpandedMobileCategory(null);
    } else {
      setExpandedMobileCategory(categoryName);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white mb-4 shadow-gray-300 shadow-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-x-2">
          <img src="/favicon.png" alt="logo" className="w-8 h-11" />
          <span className="text-xl font-semibold">Shopnexus</span>
        </Link>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center space-x-8 relative">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const hasSubcategories =
              item.subcategories && item.subcategories.length > 0;

            return (
              <div
                key={item.name}
                className="relative group px-2"
                onMouseEnter={() => setHoveredCategory(item.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {hasSubcategories ? (
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-black/80 flex items-center cursor-pointer px-2 py-1",
                      isActive
                        ? "border-b-2 border-black pb-1 text-black"
                        : "text-black/60"
                    )}
                  >
                    {item.name}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-black/80 flex items-center",
                      isActive
                        ? "border-b-2 border-black pb-1 text-black"
                        : "text-black/60"
                    )}
                  >
                    {item.name}
                  </Link>
                )}

                {/* Dropdown cho subcategories */}
                {hasSubcategories && hoveredCategory === item.name && (
                  <div className="absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2 bg-white shadow-lg rounded-md py-3 z-50">
                    <div className="absolute -top-2 left-0 right-0 h-2" />
                    {item.subcategories.map((subcat) => (
                      <Link
                        key={subcat.name}
                        to={subcat.href}
                        className="block px-6 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {subcat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex relative w-full max-w-sm mx-4"
        >
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Search products..."
            className="w-full rounded-md border border-gray-200 bg-gray-50/50 pl-8 pr-4 py-2 text-sm outline-none focus:border-gray-300"
            value={searchQuery}
            onChange={handleSearchInput}
          />
        </form>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <Link
            to="/cart"
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Shopping Cart</span>
          </Link>
          <Link
            to="/profile"
            className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 flex"
          >
            <User className="h-5 w-5" />
            <span className="sr-only">User Account</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden ml-2" onClick={toggleMenu}>
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Search */}
      <form onSubmit={handleSearch} className="md:hidden px-4 pb-3">
        <div className="relative w-full">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Search products..."
            className="w-full rounded-md border border-gray-200 bg-gray-50/50 pl-8 pr-4 py-2 text-sm outline-none focus:border-gray-300"
            value={searchQuery}
            onInput={handleSearchInput}
          />
        </div>
      </form>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const hasSubcategories =
              item.subcategories && item.subcategories.length > 0;
            const isExpanded = expandedMobileCategory === item.name;

            return (
              <div key={item.name} className="border-b">
                <div className="flex items-center justify-between">
                  {hasSubcategories ? (
                    <div
                      className={cn(
                        "block text-base font-medium py-2 transition-colors flex-grow cursor-pointer flex items-center justify-between",
                        isActive ? "text-black" : "text-black/60"
                      )}
                      onClick={() => toggleMobileCategory(item.name)}
                    >
                      {item.name}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded ? "transform rotate-180" : ""
                        )}
                      />
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "block text-base font-medium py-2 transition-colors flex-grow",
                        isActive ? "text-black" : "text-black/60"
                      )}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>

                {/* Mobile subcategories */}
                {hasSubcategories && isExpanded && (
                  <div className="pl-4 pb-2 space-y-1 bg-gray-50 rounded-md">
                    {item.subcategories.map((subcat) => (
                      <Link
                        key={subcat.name}
                        to={subcat.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-3 px-2 text-sm text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
                      >
                        {subcat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
}
