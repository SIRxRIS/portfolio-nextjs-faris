"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Home from "../components/Home";
import About from "../components/About";
import Portofolio from "../components/Portofolio";
import ContactPage from "../components/Contact";
import WelcomeScreen from "../components/WelcomeScreen";

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <>
          <Home />
          <About />
          <Portofolio />
          <ContactPage />
          <footer>
            <center>
              <hr className="my-3 border-gray-400 opacity-15 sm:mx-auto lg:my-6 text-center" />
              <span className="block text-sm pb-4 text-gray-500 text-center dark:text-gray-400">
                © 2025 <strong>Faris Hazim Supriyadi</strong>. Template by{" "}
                <a href="https://github.com/EkiZR" className="hover:underline">
                  EkiZR
                </a>
                .
              </span>
            </center>
          </footer>
        </>
      )}
    </>
  );
}
