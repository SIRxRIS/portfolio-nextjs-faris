// src/components/Navbar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
}

interface Section {
  id: string;
  offset: number;
  height: number;
}

const Navbar = () => {
  const [mounted, setMounted] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");

  const navItems: NavItem[] = [
    { href: "#Home", label: "Home" },
    { href: "#About", label: "About" },
    { href: "#Portofolio", label: "Portofolio" },
    { href: "#Contact", label: "Contact" },
  ];

  // Efek untuk menandai komponen telah di-mount


  // Efek untuk menangani scroll dan menentukan activeSection
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = navItems
        .map((item) => {
          // Menggunakan `document.getElementById` lebih disarankan jika `item.href` adalah ID
          // atau tetap menggunakan `document.querySelector`
          const section = document.querySelector(item.href);
          if (section) {
            return {
              id: item.href.replace("#", ""),
              // Mengurangi 550 mungkin terlalu banyak; coba nilai yang lebih kecil, misal 100-150
              offset: (section as HTMLElement).offsetTop - 150, // Disesuaikan untuk akurasi yang lebih baik
              height: (section as HTMLElement).offsetHeight,
            };
          }
          return null;
        })
        .filter((section): section is Section => section !== null);

      const currentPosition = window.scrollY;
      // Mencari bagian yang aktif. Menambahkan 'About' (atau section pertama) sebagai default jika tidak ada yang ditemukan
      // Ini memastikan ada aktif ketika berada di bagian atas halaman, di atas section pertama
      let activeId = sections[0]?.id || "Home"; // Default ke Home jika ada masalah

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        // Cek apakah posisi saat ini melewati offset section
        if (currentPosition >= section.offset) {
          activeId = section.id;
          break;
        }
      }

      setActiveSection(activeId);
    };

    window.addEventListener("scroll", handleScroll);
    // Panggil sekali untuk mengatur state awal
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted, navItems]); // Tambahkan navItems ke dependency jika ada kemungkinan berubah

  // Efek untuk mengunci scroll saat menu mobile terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    // Cleanup function untuk mengembalikan overflow saat komponen unmount atau isOpen berubah
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const section = document.querySelector(href);
    if (section) {
      // Mengurangi 100px dari offset untuk header tetap
      const top = (section as HTMLElement).offsetTop - 100;
      window.scrollTo({
        top: top,
        behavior: "smooth",
      });
    }
    setIsOpen(false);
  };

  // Komponen utama (render sama di server dan client, hindari hydration mismatch)
  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${mounted && isOpen
        ? "bg-[#030014] opacity-100"
        : mounted && scrolled
          ? "bg-[#030014]/50 backdrop-blur-xl"
          : "bg-transparent"
        }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-[10%]">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            {/* PERBAIKAN: Tag <a> untuk Logo */}
            <a
              href="#Home"
              onClick={(e) => scrollToSection(e, "#Home")}
              className="text-xl font-bold bg-gradient-to-r from-[#a855f7] to-[#6366f1] bg-clip-text text-transparent"
            >
              Faris Hazim Supriyadi
            </a>
          </div>

          <div className="hidden md:block">
            <div className="ml-8 flex items-center space-x-8">
              {navItems.map((item) => (
                // PERBAIKAN: Tag <a> untuk Nav Items Desktop
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className="group relative px-1 py-2 text-sm font-medium"
                >
                  <span
                    className={`relative z-10 transition-colors duration-300 ${activeSection === item.href.substring(1)
                      ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent font-semibold"
                      : "text-[#e2d3fd] group-hover:text-white"
                      }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] transform origin-left transition-transform duration-300 ${activeSection === item.href.substring(1)
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                      }`}
                  />
                </a>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative p-2 text-[#e2d3fd] hover:text-white transition-transform duration-300 ease-in-out transform ${mounted && isOpen ? "rotate-90 scale-125" : "rotate-0 scale-100"
                }`}
              disabled={!mounted}
            >
              {mounted && isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        <div
          className={`md:hidden h-2/5 fixed inset-0 bg-[#030014] transition-all duration-300 ease-in-out ${mounted && isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-[-100%] pointer-events-none"
            }`}
          style={{ top: "64px" }}
        >
          <div className="flex flex-col h-full">
            <div className="px-4 py-6 space-y-4 flex-1">
              {navItems.map((item, index) => (
                // PERBAIKAN: Tag <a> untuk Nav Items Mobile
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={`block px-4 py-3 text-lg font-medium transition-all duration-300 ease ${activeSection === item.href.substring(1)
                    ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent font-semibold"
                    : "text-[#e2d3fd] hover:text-white"
                    }`}
                  style={{
                    transitionDelay: mounted ? `${index * 100}ms` : "0ms",
                    transform: mounted && isOpen ? "translateX(0)" : "translateX(50px)",
                    opacity: mounted && isOpen ? 1 : 0,
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;