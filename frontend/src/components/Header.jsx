import { Moon, Sun } from 'lucide-react';

export default function Header({ darkMode, toggleDarkMode }) {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src="/Gemini_Generated_Image_a8c96ca8c96ca8c9.png" 
              alt="TripPeIndia Logo" 
              className="w-14 h-14 object-contain"
            />
          </div>
          {/* App Name */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              TripPeIndia
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              AI Travel Assistant for India
            </p>
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-lg hover:bg-accent transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>
    </header>
  );
}
