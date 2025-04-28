'use client';

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 px-6 border-t border-white/10 text-center text-sm text-secondary/70">
      <p>SoundLens &copy; {new Date().getFullYear()} - Know Your Music Flow</p>
    </footer>
  );
};

export default Footer;
