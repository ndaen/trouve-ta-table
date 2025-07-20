import * as React from "react";

interface InputProps {
    id: string;
    placeholder?: string;
    type?: 'text' | 'password' | 'email' | 'number';
    className?: string;
    disabled?: boolean;
    value?: string | number;
    label?: string;
    onChange?: (value: string | number) => void;

    [key: string]: any;
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
                          ...props
                      }: InputProps) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e.target.value);
        }
    }

    return (
        <div className={`input-container`}>
            {label && <label htmlFor={id} className={`input-label`}>{label}</label>}
            <input
                id={id}
                autoCapitalize="none"
                type={type}
                placeholder={placeholder}
                className={`${className} input`}
                disabled={disabled}
                value={value}
                onChange={(e) => {
                    handleChange(e)
                }}
                {...props}
            />
        </div>
    )
};
