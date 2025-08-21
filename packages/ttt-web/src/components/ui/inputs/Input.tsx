import * as React from "react";
import {DynamicIcon, type IconName} from "lucide-react/dynamic";

interface InputProps {
    id: string;
    placeholder?: string;
    type?: 'text' | 'password' | 'email' | 'number';
    className?: string;
    disabled?: boolean;
    value?: string;
    label?: string;
    onChange?: (value: string) => void;
    leftIcon?: IconName;
    required?: boolean;

    [key: string]: unknown;
}

export const Input = ({
                          id,
                          placeholder,
                          type = 'text',
                          className = '',
                          disabled = false,
                          value = '',
                          label,
                          onChange,
                          leftIcon,
                          required = false,
                          ...props
                      }: InputProps) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e.target.value);
        }
    }

    return (
        <div className={`input-container`}>
            {label && (
                <label htmlFor={id} className={`input-label`}>
                    {label}
                    {required && <span style={{color: 'var(--error)', marginLeft: '4px'}}>*</span>}
                </label>
            )}
            <div className="input-wrapper">
                {leftIcon && (
                    <div
                        className={`input-icon input-icon-left`}
                    >
                        <DynamicIcon name={leftIcon} size={16}/>
                    </div>
                )}
                <input
                    id={id}
                    autoCapitalize="none"
                    type={type}
                    placeholder={placeholder}
                    className={`${className} input ${leftIcon ? 'input-with-left-icon' : ''}`}
                    disabled={disabled}
                    value={value}
                    onChange={handleChange}
                    required={required}
                    {...props}
                />
            </div>
        </div>
    )
};