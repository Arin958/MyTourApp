import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // You can replace with your own icons or SVG

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="text-2xl font-bold text-blue-600">
            <Link to="/">TravelGo</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition">Home</Link>
            <Link to="/destinations" className="text-gray-700 hover:text-blue-600 transition">Destinations</Link>
            <Link to="/packages" className="text-gray-700 hover:text-blue-600 transition">Packages</Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition">Contact</Link>
            <Link to="/book" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle Menu">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white px-4 pb-4 space-y-2 shadow-md">
          <Link to="/" className="block text-gray-700" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/destinations" className="block text-gray-700" onClick={() => setMenuOpen(false)}>Destinations</Link>
          <Link to="/packages" className="block text-gray-700" onClick={() => setMenuOpen(false)}>Packages</Link>
          <Link to="/about" className="block text-gray-700" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="block text-gray-700" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link
            to="/book"
            className="w-full bg-blue-600 text-white py-2 rounded block text-center hover:bg-blue-700"
            onClick={() => setMenuOpen(false)}
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
