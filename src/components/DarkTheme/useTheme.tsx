import React, { createContext, useContext, useReducer, useEffect } from "react";

interface ThemeContextType {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "themePreference";

const defaultThemeContext: ThemeContextType = {
  isDarkTheme: true,
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

const themeReducer = (
  state: { isDarkTheme: boolean },
  action: { type: string }
) => {
  switch (action.type) {
    case "TOGGLE_THEME":
      return { isDarkTheme: !state.isDarkTheme };
    default:
      return state;
  }
};

const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeState, dispatch] = useReducer(themeReducer, {
    isDarkTheme: true,
  });

  // Read the theme preference from local storage when the component mounts
  useEffect(() => {
    const storedThemePreference = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedThemePreference) {
      dispatch({ type: "TOGGLE_THEME" });
    }
  }, []);

  // Add a useEffect to update the HTML class and local storage based on the theme state
  useEffect(() => {
    document.documentElement.classList.toggle(
      "pf-v5-theme-dark",
      themeState.isDarkTheme
    );
    localStorage.setItem(
      THEME_STORAGE_KEY,
      themeState.isDarkTheme ? "dark" : "light"
    );
  }, [themeState.isDarkTheme]);

  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" });
  };

  const contextValue: ThemeContextType = {
    isDarkTheme: themeState.isDarkTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeContextProvider };
