"use client";

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User } from "lucide-react";
import { cn } from "../utils/utils";
import { X } from "lucide-react";

const navItems = [
  { name: "HOME", href: "/" },
  { name: "WOMEN", href: "/women" },
  { name: "MEN", href: "/men" },
  { name: "KIDS", href: "/kids" },
];

export default function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page with query parameters
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getCurrentCategory = () => {
    const path = location.pathname;
    if (path === '/') return 'all';
    return path.slice(1).toLowerCase();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white mb-4">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to={"/"} className="flex items-center">
          <span className="text-xl font-semibold">Shoe.</span>
        </Link>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                to={item.href}
                key={item.name}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-black/80",
                  isActive
                    ? "border-b-2 border-black pb-1 text-black"
                    : "text-black/60"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex relative w-full max-w-sm mx-4">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Search products..."
            className="w-full rounded-md border border-gray-200 bg-gray-50/50 pl-8 pr-4 py-2 text-sm outline-none focus:border-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <Link to={"/cart"} className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200">
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Shopping Cart</span>
          </Link>
          <Link to={'/profile'} className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 flex">
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "block text-base font-medium py-2 border-b transition-colors",
                  isActive
                    ? "text-black border-black"
                    : "text-black/60 border-transparent"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
