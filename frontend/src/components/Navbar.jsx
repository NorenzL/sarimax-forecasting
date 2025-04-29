// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-primary flex fixed w-full top-0 left-0 right-0 z-50 justify-end items-center p-2 text-background">
      <div className="flex gap-8 min-w-[10rem]">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "bg-text px-8 py-1 rounded-full border-2 border-border"
              : "border-2 border-transparent rounded-full hover:bg-text hover:border-border px-8 py-1 transition"
          }
        >
          Dashboard
        </NavLink>
      </div>
      <NavLink
        to="/about-research"
        className={({ isActive }) =>
          isActive
            ? "bg-text px-8 py-1 rounded-full border-2 border-border"
            : "border-2 border-transparent rounded-full hover:bg-text hover:border-border px-8 py-1 transition"
        }
      >
        About Research
      </NavLink>
    </nav>
  );
};

export default Navbar;
