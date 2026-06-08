import * as React from "react";

type Theme = "dark" | "light";
type Ctx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };

const ThemeContext = React.createContext<Ctx | null>(null);

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.style.colorScheme = t;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("dark");

  React.useEffect(() => {
    const saved = localStorage.getItem("wc26.theme") as Theme | null;
    const initial: Theme = saved === "light" || saved === "dark" ? saved : "dark";
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    if (typeof window !== "undefined") localStorage.setItem("wc26.theme", t);
  }, []);

  const toggle = React.useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Ctx {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) return { theme: "dark", setTheme: () => {}, toggle: () => {} };
  return ctx;
}