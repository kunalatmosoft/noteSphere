// src/pages/NotFound.tsx

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Home, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight,
  Compass,
  Globe,
  Mail,
  Info,
  Lightbulb,
  Zap
} from "lucide-react";

// Interesting facts about the number 404
const FACTS = [
  "The HTTP 404 status code was first introduced in 1992 with the HTTP/1.0 specification.",
  "In mathematics, 404 is a semiperimeter of a Heronian triangle - a triangle with integer sides and integer area.",
  "404 is an even composite number with 6 divisors: 1, 2, 4, 101, 202, and 404.",
  "The first ever 404 error was logged at CERN in 1993 on the world's first web server.",
  "In Roman numerals, 404 is CDIV - one of the few numbers where all symbols are in descending order.",
  "404 in binary is 110010100, and in hexadecimal it's 194.",
  "The number 404 is a 'noncototient' - meaning it cannot be expressed as a number minus its prime count.",
  "404 appears 404 times in the first 100,000 digits of pi (coincidence? Probably!)."
];

export default function NotFound() {
  const [fact, setFact] = useState(FACTS[0]);
  const [factIndex, setFactIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * FACTS.length);
    setFactIndex(randomIndex);
    setFact(FACTS[randomIndex]);
  }, []);

  const refreshFact = () => {
    setIsRotating(true);
    const newIndex = (factIndex + 1) % FACTS.length;
    setFactIndex(newIndex);
    setFact(FACTS[newIndex]);
    
    setTimeout(() => {
      setIsRotating(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          {/* Header with subtle accent line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600" />
          
          <div className="p-8 md:p-10">
            {/* 404 Number with icon */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-7xl md:text-8xl font-light text-slate-800 tracking-tight">
                    404
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <AlertCircle size={16} strokeWidth={1.5} />
                  <span className="text-sm font-medium uppercase tracking-wider">Page Not Found</span>
                </div>
              </div>
              <div className="bg-slate-100 rounded-xl p-3 border border-slate-200/50">
                <Compass size={28} className="text-slate-600" strokeWidth={1.5} />
              </div>
            </div>

            {/* Error message */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Looks like you've taken a wrong turn
              </h2>
              <p className="text-slate-500 leading-relaxed">
                The page you're looking for doesn't exist or has been moved. 
                Don't worry though — we can help you find your way back.
              </p>
            </div>

            {/* Interesting Fact Section */}
            <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-200/60">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="bg-slate-200/50 rounded-lg p-1.5">
                    <Lightbulb size={18} className="text-slate-600" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Did You Know?
                    </p>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">
                      {factIndex + 1}/{FACTS.length}
                    </span>
                  </div>
                  <p 
                    className={`text-sm text-slate-700 leading-relaxed transition-all duration-300 ${
                      isRotating ? 'opacity-0 transform -translate-y-1' : 'opacity-100 transform translate-y-0'
                    }`}
                  >
                    {fact}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 font-medium text-sm group"
              >
                <Home size={18} strokeWidth={1.75} />
                <span>Go Home</span>
                <ArrowRight 
                  size={16} 
                  strokeWidth={1.75} 
                  className="group-hover:translate-x-0.5 transition-transform" 
                />
              </Link>
              
              <button
                onClick={refreshFact}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200 font-medium text-sm border border-slate-200/60"
              >
                <RefreshCw 
                  size={17} 
                  strokeWidth={1.75} 
                  className={`transition-transform duration-400 ${isRotating ? 'rotate-180' : ''}`}
                />
                <span>New Fact</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          <Link 
            to="/" 
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors duration-200 group"
          >
            <Home size={15} strokeWidth={1.5} />
            <span>Home</span>
          </Link>
          
          <span className="text-slate-300 select-none">•</span>
          
          <Link 
            to="/about" 
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors duration-200 group"
          >
            <Info size={15} strokeWidth={1.5} />
            <span>About</span>
          </Link>
          
          <span className="text-slate-300 select-none">•</span>
          
          <Link 
            to="/contact" 
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors duration-200 group"
          >
            <Mail size={15} strokeWidth={1.5} />
            <span>Contact</span>
          </Link>
          
          <span className="text-slate-300 select-none">•</span>
          
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors duration-200"
          >
            <Globe size={15} strokeWidth={1.5} />
            <span>Retry</span>
          </button>
        </div>

        {/* Footer note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Zap size={12} strokeWidth={1.5} />
            <span>Even Google's 404 page has a dinosaur — you're in good company</span>
          </p>
        </div>
      </div>
    </div>
  );
}