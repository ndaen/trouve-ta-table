import * as React from "react";

interface LinkProps {
    href: string;
    className?: string;
    children?: React.ReactNode;
}

const Link = ({href, className = 'link', children}: LinkProps ) => {
    return (
        <a href={href} className={className}>
            {children}
        </a>
    );
}

export default Link;