"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Fixed top navigation */}
      <nav className="fixed top-0 left-0 w-full bg-gray-800/90 backdrop-blur-md px-6 py-4 flex justify-between items-center z-50">
        <span
          className="text-white font-bold text-lg cursor-pointer"
          onClick={() => router.push('/')}
        >
          Financer
        </span>
        <div className="space-x-6">
          <span
            className="text-white hover:text-purple-400 cursor-pointer transition-colors duration-300"
            onClick={() => router.push('/upload')}
          >
            Upload
          </span>
          <span className="text-white hover:text-purple-400 cursor-pointer transition-colors duration-300">
            About
          </span>
          <span className="text-white hover:text-purple-400 cursor-pointer transition-colors duration-300">
            Contact
          </span>
        </div>
      </nav>

      {/* Container for title and text, with padding to avoid nav */}
      <div className="relative z-10 pt-28 px-10 md:px-20">
        {/* Title */}
        <h1
          style={{ fontFamily: "'Montserrat', sans-serif" }}
          className="text-white text-6xl md:text-8xl lg:text-9xl font-extrabold leading-tight"
        >
          Financer
        </h1>

        {/* Subtitle */}
        <p className="text-white/90 text-xl md:text-2xl mt-6 max-w-lg">
          Easily track, categorize, and visualize your expenses
        </p>

        {/* Clickable text */}
        <span
          onClick={() => router.push('/upload')}
          className="block mt-4 text-white font-semibold text-xl md:text-2xl cursor-pointer hover:underline hover:text-purple-400 transition-all duration-300"
        >
          Get Started
        </span>
      </div>
    </main>
  );
}
