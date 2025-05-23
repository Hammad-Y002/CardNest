import { useState } from 'react';

export default function TestTailwind() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="p-8 bg-background text-foreground transition-colors duration-300">
        {/* Header with basic utilities */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Tailwind CSS Test Component</h1>
          <p className="text-muted-foreground text-lg">
            Testing Tailwind CSS v4 configuration
          </p>
          <button
            onClick={toggleDarkMode}
            className="mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Toggle {darkMode ? 'Light' : 'Dark'} Mode
          </button>
        </header>

        {/* Card with various utilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Basic utilities */}
          <div className="p-6 rounded-lg bg-card text-card-foreground shadow-md border border-border">
            <h2 className="text-2xl font-semibold mb-4">Basic Utilities</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="h-8 w-full bg-primary rounded"></div>
                <div className="h-8 w-full bg-secondary rounded"></div>
                <div className="h-8 w-full bg-accent rounded"></div>
                <div className="h-8 w-full bg-muted rounded"></div>
                <div className="h-8 w-full bg-destructive rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-16 w-16 rounded-sm bg-primary"></div>
                <div className="h-16 w-16 rounded-md bg-primary"></div>
                <div className="h-16 w-16 rounded-lg bg-primary"></div>
                <div className="h-16 w-16 rounded-full bg-primary"></div>
              </div>
            </div>
          </div>

          {/* Card 2: Dark mode specific */}
          <div className="p-6 rounded-lg bg-card text-card-foreground shadow-md border border-border">
            <h2 className="text-2xl font-semibold mb-4">Dark Mode</h2>
            <div className="space-y-4">
              <p className="dark:text-primary-foreground">This text changes color in dark mode</p>
              <div className="h-16 bg-white dark:bg-black rounded flex items-center justify-center">
                <span className="text-black dark:text-white">Dark mode content</span>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground rounded">
                Styled Button
              </button>
            </div>
          </div>

          {/* Card 3: Custom theme values */}
          <div className="p-6 rounded-lg bg-card text-card-foreground shadow-md border border-border">
            <h2 className="text-2xl font-semibold mb-4">Custom Theme</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                <div className="h-8 w-full bg-chart-1 rounded"></div>
                <div className="h-8 w-full bg-chart-2 rounded"></div>
                <div className="h-8 w-full bg-chart-3 rounded"></div>
                <div className="h-8 w-full bg-chart-4 rounded"></div>
                <div className="h-8 w-full bg-chart-5 rounded"></div>
              </div>
              <div className="h-16 bg-popover text-popover-foreground rounded-lg flex items-center justify-center p-4">
                Custom popover styles
              </div>
              <div className="rounded-sm p-2 border-2 border-ring">
                Custom ring color
              </div>
            </div>
          </div>
        </div>

        {/* Responsive section */}
        <div className="mt-8 p-6 rounded-lg bg-card text-card-foreground shadow-md border border-border">
          <h2 className="text-2xl font-semibold mb-4">Responsive Design</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-primary/60 rounded flex items-center justify-center">
                  <span className="font-bold">Box {i + 1}</span>
                </div>
              ))}
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
              This text changes size based on screen width
            </p>
            <div className="p-4 bg-muted rounded">
              <p className="block md:hidden">Visible only on mobile</p>
              <p className="hidden md:block lg:hidden">Visible only on tablet</p>
              <p className="hidden lg:block xl:hidden">Visible only on desktop</p>
              <p className="hidden xl:block">Visible only on extra large screens</p>
            </div>
          </div>
        </div>

        {/* Animation section */}
        <div className="mt-8 p-6 rounded-lg bg-card text-card-foreground shadow-md border border-border">
          <h2 className="text-2xl font-semibold mb-4">Animations</h2>
          <div className="flex flex-wrap gap-4">
            <div className="w-16 h-16 bg-primary rounded-lg animate-spin"></div>
            <div className="w-16 h-16 bg-secondary rounded-lg animate-pulse"></div>
            <div className="w-16 h-16 bg-accent rounded-lg animate-bounce"></div>
            <div className="w-16 h-16 bg-destructive rounded-lg animate-ping"></div>
            <div className="w-16 h-16 bg-chart-1 rounded-lg animate-accordion-down"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

