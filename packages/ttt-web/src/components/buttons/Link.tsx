import * as React from "react";

interface LinkProps {
    href: string;
    className?: string;
    children?: React.ReactNode;
}

export const Link = ({href, className = 'link', children}: LinkProps ) => {


    return (
        <a href={href} className={className}>
            {children}
        </a>
    );
}