import * as React from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

interface SelectOption {
    value: string;
    label: string;
    icon?: IconName;
}

interface SelectProps {
    id: string;
    label?: string;
    placeholder?: string;
    value?: string;
    options: SelectOption[];
    onChange?: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    className?: string;
}

export const Select = ({
    id,
    label,
    placeholder = "Sélectionner...",
    value = "",
    options,
    onChange,
    disabled = false,
    required = false,
    error,
    className = ""
}: SelectProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const selectRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find(option => option.value === value);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setFocusedIndex(-1);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            setFocusedIndex(-1);
        }
    };

    const handleOptionSelect = (optionValue: string) => {
        if (onChange) {
            onChange(optionValue);
        }
        setIsOpen(false);
        setFocusedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
            case "Enter":
                e.preventDefault();
                if (isOpen && focusedIndex >= 0) {
                    handleOptionSelect(options[focusedIndex].value);
                } else {
                    setIsOpen(true);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setFocusedIndex(-1);
                break;
            case "ArrowDown":
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                    setFocusedIndex(0);
                } else {
                    setFocusedIndex(prev => 
                        prev < options.length - 1 ? prev + 1 : 0
                    );
                }
                break;
            case "ArrowUp":
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                    setFocusedIndex(options.length - 1);
                } else {
                    setFocusedIndex(prev => 
                        prev > 0 ? prev - 1 : options.length - 1
                    );
                }
                break;
        }
    };

    return (
        <div className="input-container">
            {label && (
                <label htmlFor={id} className="input-label">
                    {label}
                    {required && <span style={{color: 'var(--error)', marginLeft: '4px'}}>*</span>}
                </label>
            )}
            <div className="input-wrapper" ref={selectRef} style={{ position: 'relative' }}>
                <div
                    id={id}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-required={required}
                    aria-invalid={!!error}
                    tabIndex={disabled ? -1 : 0}
                    className={`input input-with-right-icon ${className} ${error ? 'border-error' : ''}`}
                    onClick={handleToggle}
                    onKeyDown={handleKeyDown}
                    style={{
                        backgroundColor: disabled ? 'var(--muted)' : 'var(--input)',
                        cursor: disabled ? 'not-allowed' : 'pointer'
                    }}
                >
                    <div className="select-content">
                        {selectedOption?.icon && (
                            <DynamicIcon 
                                name={selectedOption.icon} 
                                size={16}
                                style={{ color: 'var(--muted-foreground)' }}
                            />
                        )}
                        <span className={selectedOption ? 'select-value' : 'select-placeholder'}>
                            {selectedOption?.label || placeholder}
                        </span>
                    </div>
                </div>
                
                {/* Chevron icon positioned on the right */}
                <div className="input-icon input-icon-right">
                    <DynamicIcon
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={16}
                        style={{ color: 'var(--muted-foreground)' }}
                    />
                </div>

                {isOpen && (
                    <div className="select-dropdown">
                        <ul role="listbox" className="select-options">
                            {options.map((option, index) => (
                                <li
                                    key={option.value}
                                    role="option"
                                    aria-selected={option.value === value}
                                    className={`select-option ${
                                        option.value === value ? 'selected' : ''
                                    } ${
                                        index === focusedIndex ? 'focused' : ''
                                    }`}
                                    onClick={() => handleOptionSelect(option.value)}
                                >
                                    {option.icon && (
                                        <DynamicIcon 
                                            name={option.icon} 
                                            size={16}
                                        />
                                    )}
                                    <span>{option.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {error && (
                <span className="text-error text-sm mt-1">{error}</span>
            )}
        </div>
    );
};