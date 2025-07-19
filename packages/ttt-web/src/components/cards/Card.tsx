import * as React from "react";

interface CardProps {
    header: React.ReactNode;
    description?: React.ReactNode;
    body: React.ReactNode;
}

export default function Card({header, description, body}: CardProps) {
    return (
        <div
            className={`card`}>
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
