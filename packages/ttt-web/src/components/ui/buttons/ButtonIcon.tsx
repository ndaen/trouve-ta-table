import {DynamicIcon, type IconName} from "lucide-react/dynamic";

interface ButtonIconProps {
    onClick?: () => void;
    variant?: 'btn-primary' | 'btn-secondary' | 'btn-outline' | 'btn-ghost' | 'btn-destructive';
    size?: 'sm' | 'default' | 'lg';
    iconSize?: number;
    disabled?: boolean;
    icon: IconName;
    title?: string;
    type?: 'button' | 'submit' | 'reset';
    isLoading?: boolean;
}

export default function ButtonIcon({ 
    onClick, 
    variant = 'btn-primary', 
    size = 'default',
    iconSize, 
    disabled = false, 
    icon, 
    title = 'Bouton',
    type = 'button',
    isLoading = false
}: ButtonIconProps) {
    const sizes = {
        sm: 'btn-sm',
        default: 'btn-md',
        lg: 'btn-lg',
    };

    // Calculate icon size based on button size if not explicitly provided
    const calculatedIconSize = iconSize ?? (size === 'sm' ? 14 : size === 'lg' ? 18 : 16);
    
    const isDisabled = disabled || isLoading;

    return (
        <button
            onClick={onClick}
            className={`btn btn-icon ${variant} ${sizes[size]}`}
            disabled={isDisabled}
            title={title}
            type={type}
        >
            {isLoading ? (
                <DynamicIcon
                    name="loader-2"
                    size={calculatedIconSize}
                    className="animate-spin"
                />
            ) : (
                <DynamicIcon name={icon} size={calculatedIconSize} />
            )}
        </button>
    );
}