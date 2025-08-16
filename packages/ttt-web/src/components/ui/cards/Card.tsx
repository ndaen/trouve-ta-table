import * as React from "react";

interface CardProps {
    header: React.ReactNode;
    description?: React.ReactNode;
    body: React.ReactNode;
    actions?: () => void;
    className?: string;
}

export default function Card({header, description, body, actions, className}: CardProps) {
    return (
        <div
            className={`card ${actions ? 'cursor-pointer' : ''} ${className ? className : ''}`}
            onClick={actions}
        >
            <div className={'card-header'}>
                {header}
                {description && <p className={'card-description'}>{description}</p>}
            </div>
            <div className={'card-content'}>
                {body}
            </div>
        </div>
    )
}
