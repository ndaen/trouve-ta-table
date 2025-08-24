import * as React from "react";
import { DynamicIcon } from "lucide-react/dynamic";

interface SearchInputProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function SearchInput({ 
    placeholder = "Rechercher...", 
    value, 
    onChange, 
    className = '' 
}: SearchInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitizedValue = e.target.value.slice(0, 100);
        onChange(sanitizedValue);
    };

    const clearSearch = () => {
        onChange('');
    };

    return (
        <div className={`input-wrapper ${className}`}>
            <div className="input-icon input-icon-left">
                <DynamicIcon name="search" size={16} />
            </div>
            <input
                type="text"
                placeholder={placeholder}
                className="input input-with-left-icon input-with-right-icon"
                value={value}
                onChange={handleChange}
                aria-label={placeholder}
                role="searchbox"
            />
            {value && (
                <button 
                    type="button"
                    className="input-icon input-icon-right input-icon-clickable" 
                    onClick={clearSearch}
                    aria-label="Effacer la recherche"
                >
                    <DynamicIcon name="x" size={16} />
                </button>
            )}
        </div>
    );
}