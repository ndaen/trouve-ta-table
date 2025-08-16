import {DynamicIcon, type IconName} from "lucide-react/dynamic";

interface ButtonIconProps {
    onClick?: () => void;
    variant?: 'btn-primary' | 'btn-secondary' | 'btn-outline' | 'btn-ghost' | 'btn-destructive';
    iconSize?: number;
    disabled?: boolean;
    icon: IconName;
}

export default function ButtonIcon({ onClick, variant = 'btn-primary', iconSize, disabled = false, icon }: ButtonIconProps) {
    return (
        <button
            onClick={onClick}
            className={`btn btn-icon ${variant}`}
            disabled={disabled}
        >
            <DynamicIcon name={icon} size={iconSize} />
        </button>
    );
}