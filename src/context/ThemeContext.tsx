import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import { getDatabase } from "../db/database";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference from database
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const db = await getDatabase();
        const result = await db.getFirstAsync<{ value: string }>(
          "SELECT value FROM settings WHERE key = ?",
          ["theme"],
        );
        if (result && ["light", "dark", "system"].includes(result.value)) {
          setThemeState(result.value as ThemeMode);
        }
      } catch (error) {
        // Settings table might not exist, use default
        console.log("Using default theme");
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Calculate resolved theme based on mode
  const resolvedTheme: "light" | "dark" =
    theme === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : theme;

  const isDark = resolvedTheme === "dark";

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      const db = await getDatabase();
      // Ensure settings table exists
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
      await db.runAsync(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
        ["theme", newTheme],
      );
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  // Update appearance when theme changes
  useEffect(() => {
    if (theme === "system") {
      Appearance.setColorScheme(undefined);
    } else {
      Appearance.setColorScheme(theme);
    }
  }, [theme]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
