import React from 'react';

interface ProgressBarProps {
    value: number;
    max: number;
    label?: string;
    showValues?: boolean;
    height?: number;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    className?: string;
    customValueText?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
                                                     value,
                                                     max,
                                                     label,
                                                     showValues = true,
                                                     height = 8,
                                                     color = 'primary',
                                                     className = '',
                                                     customValueText
                                                 }) => {
    const percentage = Math.min((value / max) * 100, 100);

    const getColorClass = (color: string) => {
        switch (color) {
            case 'primary':
                return 'bg-primary';
            case 'secondary':
                return 'bg-secondary';
            case 'success':
                return 'bg-success';
            case 'warning':
                return 'bg-warning';
            case 'error':
                return 'bg-error';
            case 'info':
                return 'bg-info';
            default:
                return 'bg-primary';
        }
    };

    const progressColorClass = getColorClass(color);

    return (
        <div className={`progress-container ${className}`}>
            {(label || showValues) && (
                <div className="progress-label">
                    {label && <span className="progress-label-text">{label}</span>}
                    {showValues && (
                        <span className="progress-values">
              {customValueText || `${value}/${max}`}
            </span>
                    )}
                </div>
            )}

            <div
                className="progress-bar"
                style={{height: `${height}px`}}
            >
                <div
                    className={`progress-fill ${progressColorClass}`}
                    style={{
                        width: `${percentage}%`,
                        height: `${height}px`
                    }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;