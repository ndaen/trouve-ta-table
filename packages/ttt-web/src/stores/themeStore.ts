import {create} from 'zustand';

interface ThemeState {
    darkMode: boolean;
    setDarkMode: (darkMode: boolean) => void;
    toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,

    setDarkMode: (darkMode: boolean) => {
        set({darkMode});
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    },

    toggleDarkMode: () => {
        const newDarkMode = !get().darkMode;
        get().setDarkMode(newDarkMode);
    }
}));

export const useTheme = () => {
    const {darkMode, setDarkMode, toggleDarkMode} = useThemeStore();
    return {darkMode, setDarkMode, toggleDarkMode};
};