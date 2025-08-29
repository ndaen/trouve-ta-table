import Tabs, { type Tab } from "@/components/ui/Tabs.tsx";

interface ProjectTabsProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export default function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
    const tabs: Tab[] = [
        { id: 'overview', label: 'Vue d\'ensemble' },
        { id: 'tables', label: 'Tables' },
        { id: 'guests', label: 'Invités' },
        { id: 'qrcode', label: 'QR Code' }
    ];

    return (
        <div className="project-tabs">
            <Tabs 
                tabs={tabs} 
                activeTab={activeTab} 
                onTabChange={onTabChange}
            />
        </div>
    );
}