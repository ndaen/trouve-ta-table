import * as React from "react";

export interface Tab {
    id: string;
    label: string;
    content?: React.ReactNode;
    disabled?: boolean;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
    children?: React.ReactNode;
}

export default function Tabs({ 
    tabs, 
    activeTab, 
    onTabChange, 
    className = '',
    children 
}: TabsProps) {
    const handleTabClick = (tabId: string) => {
        const tab = tabs.find(t => t.id === tabId);
        if (!tab?.disabled) {
            onTabChange(tabId);
        }
    };

    const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

    return (
        <div className={`tabs-container ${className}`}>
            <div 
                className="flex"
                style={{ borderBottom: '1px solid var(--border)' }}
            >
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className="cursor-pointer transition-colors"
                        style={{
                            position: 'relative',
                            padding: '12px 16px',
                            color: tab.disabled 
                                ? 'var(--muted-foreground)'
                                : activeTab === tab.id 
                                    ? 'var(--foreground)' 
                                    : 'var(--muted-foreground)',
                            fontWeight: activeTab === tab.id ? '500' : '400',
                            opacity: tab.disabled ? 0.5 : 1,
                            cursor: tab.disabled ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => handleTabClick(tab.id)}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div 
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    left: '0',
                                    right: '0',
                                    height: '2px',
                                    backgroundColor: 'var(--primary)',
                                    transition: 'all 0.2s'
                                }} 
                            />
                        )}
                    </div>
                ))}
            </div>
            
            <div className="mt-4">
                {children || activeTabContent}
            </div>
        </div>
    );
}