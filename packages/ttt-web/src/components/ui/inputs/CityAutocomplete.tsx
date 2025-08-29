import * as React from "react";
import { DynamicIcon } from "lucide-react/dynamic";
import { citiesService, type City } from "@/services/citiesService";

interface CityAutocompleteProps {
    id: string;
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    className?: string;
    placeholder?: string;
}

export const CityAutocomplete = ({
    id,
    label,
    value = "",
    onChange,
    disabled = false,
    required = false,
    error,
    className = "",
    placeholder = "Rechercher une ville..."
}: CityAutocompleteProps) => {
    const [inputValue, setInputValue] = React.useState(value);
    const [isOpen, setIsOpen] = React.useState(false);
    const [filteredCities, setFilteredCities] = React.useState<City[]>([]);
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const [isLoading, setIsLoading] = React.useState(false);
    const autocompleteRef = React.useRef<HTMLDivElement>(null);
    const searchTimeoutRef = React.useRef<NodeJS.Timeout>(null);

    // Update input value when prop value changes
    React.useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Search cities with debouncing
    React.useEffect(() => {
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (inputValue.length >= 2) {
            setIsLoading(true);
            
            // Debounce search by 300ms
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const results = await citiesService.searchCities(inputValue, 8);
                    setFilteredCities(results);
                    setIsOpen(results.length > 0);
                    setIsLoading(false);
                } catch (error) {
                    console.error('Error searching cities:', error);
                    setFilteredCities([]);
                    setIsOpen(false);
                    setIsLoading(false);
                }
            }, 300);
        } else {
            setFilteredCities([]);
            setIsOpen(false);
            setIsLoading(false);
        }

        // Cleanup function
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [inputValue]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
        setFocusedIndex(-1);
    };

    const handleCitySelect = (city: City) => {
        setInputValue(city.display);
        if (onChange) {
            onChange(city.display);
        }
        setIsOpen(false);
        setFocusedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled || !isOpen) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setFocusedIndex(prev => 
                    prev < filteredCities.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setFocusedIndex(prev => 
                    prev > 0 ? prev - 1 : filteredCities.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (focusedIndex >= 0 && filteredCities[focusedIndex]) {
                    handleCitySelect(filteredCities[focusedIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setFocusedIndex(-1);
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
            <div className="input-wrapper" ref={autocompleteRef} style={{ position: 'relative' }}>
                <input
                    id={id}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    required={required}
                    placeholder={placeholder}
                    className={`input input-with-right-icon ${className} ${error ? 'border-error' : ''}`}
                    style={{
                        backgroundColor: disabled ? 'var(--muted)' : 'var(--input)',
                        cursor: disabled ? 'not-allowed' : 'text'
                    }}
                    autoComplete="off"
                />
                
                {/* Map pin icon positioned on the right */}
                <div className="input-icon input-icon-right">
                    <DynamicIcon name="map-pin" size={16} style={{ color: 'var(--muted-foreground)' }} />
                </div>

                {isOpen && isLoading && (
                    <div className="select-dropdown">
                        <div className="select-options">
                            <div style={{ 
                                padding: 'var(--space-3)', 
                                color: 'var(--muted-foreground)', 
                                textAlign: 'center',
                                fontSize: 'var(--text-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--space-2)'
                            }}>
                                <DynamicIcon name="loader-2" size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                Recherche en cours...
                            </div>
                        </div>
                    </div>
                )}

                {isOpen && !isLoading && filteredCities.length > 0 && (
                    <div className="select-dropdown">
                        <ul role="listbox" className="select-options">
                            {filteredCities.map((city, index) => (
                                <li
                                    key={`${city.name}-${city.country}`}
                                    role="option"
                                    className={`select-option ${
                                        index === focusedIndex ? 'focused' : ''
                                    }`}
                                    onClick={() => handleCitySelect(city)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: 'var(--space-1)'
                                    }}
                                >
                                    <span style={{ fontWeight: 'var(--font-medium)' }}>
                                        {city.name}
                                    </span>
                                    <span style={{ 
                                        fontSize: 'var(--text-xs)', 
                                        color: 'var(--muted-foreground)' 
                                    }}>
                                        {city.country}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {isOpen && !isLoading && filteredCities.length === 0 && inputValue.length >= 2 && (
                    <div className="select-dropdown">
                        <div className="select-options">
                            <div style={{ 
                                padding: 'var(--space-3)', 
                                color: 'var(--muted-foreground)', 
                                textAlign: 'center',
                                fontSize: 'var(--text-sm)'
                            }}>
                                Aucune ville trouvée pour "{inputValue}"
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {error && (
                <span style={{ 
                    color: 'var(--error)', 
                    fontSize: 'var(--text-sm)', 
                    marginTop: 'var(--space-1)' 
                }}>
                    {error}
                </span>
            )}
        </div>
    );
};