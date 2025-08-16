import * as React from "react";

interface BadgeProps {
    variant?: 'badge-default' | 'badge-secondary' | 'badge-success' | 'badge-warning' | 'badge-error' | 'badge-info' | 'badge-outline';
    children: React.ReactNode;
}
export default function Badge ({ variant = 'badge-default', children }: BadgeProps) {
    return (
        <span
            className={`badge ${variant}`}
        >
        {children}
      </span>
    );
};
