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
}

export default function Button({ children, onClick, variant = 'btn-primary', size = 'default', disabled = false, icon = null, type = 'button' }: ButtonProps) {
    const sizes = {
        sm: 'btn-sm',
        default: 'btn-md',
        lg: 'btn-lg',
    };

    return (
        <button
            onClick={onClick}
            className={`btn ${variant} ${sizes[size]}`}
            disabled={disabled}
            type={type}
        >
            {icon && <DynamicIcon name={icon} size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
            {children}
        </button>
    );
}