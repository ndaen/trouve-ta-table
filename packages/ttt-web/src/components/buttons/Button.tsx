import * as React from "react";
import {DynamicIcon, type IconName} from "lucide-react/dynamic";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'btn-primary' | 'btn-secondary' | 'btn-outline' | 'btn-ghost' | 'btn-destructive';
    size?: 'sm' | 'default' | 'lg';
    disabled?: boolean;
    icon?: IconName | null;
    type?: 'button' | 'submit' | 'reset';
    isLoading?: boolean;
}

export default function Button({
                                   children,
                                   onClick,
                                   variant = 'btn-primary',
                                   size = 'default',
                                   disabled = false,
                                   icon = null,
                                   type = 'button',
                                   isLoading = false
                               }: ButtonProps) {
    const sizes = {
        sm: 'btn-sm',
        default: 'btn-md',
        lg: 'btn-lg',
    };

    const isDisabled = disabled || isLoading;

    return (
        <button
            onClick={onClick}
            className={`btn ${variant} ${sizes[size]}`}
            disabled={isDisabled}
            type={type}
        >
            {isLoading ? (
                <DynamicIcon
                    name="loader-2"
                    size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
                    className="animate-spin"
                />
            ) : (
                icon && <DynamicIcon name={icon} size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}/>
            )}
            {children}
        </button>
    );
}