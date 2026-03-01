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

  // Load saved theme preference from database.
  // NOTE: initDatabase() in _layout.tsx runs BEFORE ThemeProvider mounts,
  // so the settings table is guaranteed to exist by the time this runs.
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
        // Settings table might not exist on first run — default "system" is fine.
        console.log(
          "[Theme] Could not load saved theme, using system default:",
          error,
        );
      }
    };
    loadTheme();
  }, []);

  // Resolved theme based on current mode
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
      await db.runAsync(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
        ["theme", newTheme],
      );
    } catch (error) {
      console.error("[Theme] Failed to save theme:", error);
    }
  };

  // Sync RN Appearance API when theme changes
  useEffect(() => {
    if (theme === "system") {
      Appearance.setColorScheme(undefined);
    } else {
      Appearance.setColorScheme(theme);
    }
  }, [theme]);

  // IMPORTANT: Do NOT return null here while "loading" the theme.
  // Returning null causes the entire app to render a blank screen in production.
  // Instead we render immediately with the default "system" theme, and the
  // useEffect above will update it asynchronously — users will never notice
  // the brief moment before the persisted preference loads.
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
