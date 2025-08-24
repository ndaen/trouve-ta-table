import {useTheme} from "@/stores/themeStore.ts";
import ButtonIcon from "@/components/ui/buttons/ButtonIcon.tsx";

const ThemeToggleButton = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <ButtonIcon icon={darkMode ? "sun" : "moon"} iconSize={16} variant={'btn-outline'} onClick={toggleDarkMode} />
    );
}

export default ThemeToggleButton;