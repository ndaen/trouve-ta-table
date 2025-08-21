import * as React from "react";

interface ModalProps {
    header: React.ReactNode;
    description?: React.ReactNode;
    body: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({header, description, body, isOpen, onClose, className, size = 'md'}: ModalProps) {
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div
                className={`modal modal-${size} ${className ? className : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    {header}
                    {description && <p className="modal-description">{description}</p>}
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="modal-content">
                    {body}
                </div>
            </div>
        </div>
    );
}