import * as React from "react";
import {useState} from "react";
import {DynamicIcon} from "lucide-react/dynamic";

interface InputProps {
    id: string;
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    value?: string;
    label?: string;
    onChange?: (value: string) => void;

    [key: string]: any;
}

export const InputPassword = ({
                                  id,
                                  className = '',
                                  disabled = false,
                                  placeholder = '',
                                  value = '',
                                  label,
                                  onChange,
                                  leftIcon,
                                  rightIcon,
                                  onRightIconClick,
                                  ...props
                              }: InputProps) => {

    const [isVisible, setIsVisible] = useState(false)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e.target.value);
        }
    }

    return (
        <div className={`input-container`}>
            {label && <label htmlFor={id} className={`input-label`}>{label}</label>}
            <div className="input-wrapper">
                <div
                    className={`input-icon input-icon-left`}
                >
                    <DynamicIcon name={'lock-keyhole'} size={16}/>
                </div>
                <input
                    id={id}
                    autoCapitalize="none"
                    type={isVisible ? 'text' : 'password'}
                    placeholder={placeholder}
                    className={`${className} input input-with-left-icon input-with-right-icon`}
                    disabled={disabled}
                    value={value}
                    onChange={handleChange}
                    {...props}
                />
                <div
                    className={`input-icon input-icon-right input-icon-clickable`}
                    onClick={() => setIsVisible(!isVisible)}
                >
                    <DynamicIcon name={isVisible ? 'eye' : 'eye-closed'} size={16}/>
                </div>
            </div>
        </div>
    )
};