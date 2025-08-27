import * as React from "react";
import { DynamicIcon } from "lucide-react/dynamic";

interface DatePickerProps {
    id: string;
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    className?: string;
    minDate?: string;
}

export const DatePicker = ({
    id,
    label,
    value = "",
    onChange,
    disabled = false,
    required = false,
    error,
    className = "",
    minDate
}: DatePickerProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [displayDate, setDisplayDate] = React.useState(() => value ? new Date(value) : new Date());
    const pickerRef = React.useRef<HTMLDivElement>(null);
    
    const today = new Date();
    const minDateObj = minDate ? new Date(minDate) : today;
    const selectedDate = value ? new Date(value) : null;

    // Update displayDate when value changes (for edit mode)
    React.useEffect(() => {
        if (value) {
            setDisplayDate(new Date(value));
        }
    }, [value]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const formatDisplayDate = (date: Date | null) => {
        if (!date) return "";
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getMonthYearDisplay = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
        });
    };

    const getCalendarDays = () => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        const currentDate = new Date(startDate);
        
        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return days;
    };

    const handleDateSelect = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        if (onChange) {
            onChange(dateString);
        }
        setIsOpen(false);
    };

    const navigateMonth = (direction: number) => {
        setDisplayDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + direction);
            return newDate;
        });
    };

    const isDateDisabled = (date: Date) => {
        return date < minDateObj;
    };

    const isToday = (date: Date) => {
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date: Date) => {
        return selectedDate && date.toDateString() === selectedDate.toDateString();
    };

    const isOtherMonth = (date: Date) => {
        return date.getMonth() !== displayDate.getMonth();
    };

    const dayHeaders = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    return (
        <div className="input-container">
            {label && (
                <label htmlFor={id} className="input-label">
                    {label}
                    {required && <span style={{color: 'var(--error)', marginLeft: '4px'}}>*</span>}
                </label>
            )}
            <div className="input-wrapper" ref={pickerRef} style={{ position: 'relative' }}>
                <input
                    id={id}
                    type="text"
                    value={formatDisplayDate(selectedDate)}
                    readOnly
                    disabled={disabled}
                    required={required}
                    className={`input input-with-right-icon ${className} ${error ? 'border-error' : ''}`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    style={{
                        backgroundColor: disabled ? 'var(--muted)' : 'var(--input)',
                        cursor: disabled ? 'not-allowed' : 'pointer'
                    }}
                    placeholder="JJ/MM/AAAA"
                />
                
                {/* Calendar icon positioned on the right */}
                <div className="input-icon input-icon-right">
                    <DynamicIcon name="calendar" size={16}/>
                </div>

                {isOpen && (
                    <div className="calendar-popup">
                        <div className="calendar-header">
                            <button 
                                className="calendar-nav-button"
                                onClick={() => navigateMonth(-1)}
                                type="button"
                            >
                                <DynamicIcon name="chevron-left" size={16} />
                            </button>
                            <div className="calendar-month-year">
                                {getMonthYearDisplay(displayDate)}
                            </div>
                            <button 
                                className="calendar-nav-button"
                                onClick={() => navigateMonth(1)}
                                type="button"
                            >
                                <DynamicIcon name="chevron-right" size={16} />
                            </button>
                        </div>

                        <div className="calendar-grid">
                            {dayHeaders.map((day, index) => (
                                <div key={index} className="calendar-day-header">
                                    {day}
                                </div>
                            ))}
                            
                            {getCalendarDays().map((date, index) => {
                                const disabled = isDateDisabled(date);
                                const selected = isSelected(date);
                                const todayClass = isToday(date);
                                const otherMonth = isOtherMonth(date);
                                
                                return (
                                    <div
                                        key={index}
                                        className={`calendar-day ${
                                            selected ? 'selected' : ''
                                        } ${
                                            todayClass ? 'today' : ''
                                        } ${
                                            otherMonth ? 'other-month' : ''
                                        } ${
                                            disabled ? 'disabled' : ''
                                        }`}
                                        onClick={() => !disabled && handleDateSelect(date)}
                                    >
                                        {date.getDate()}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            {error && (
                <span style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                    {error}
                </span>
            )}
        </div>
    );
};