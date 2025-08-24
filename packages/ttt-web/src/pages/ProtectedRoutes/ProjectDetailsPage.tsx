import {useEffect, useMemo, useState} from 'react';
import {Link, useParams, useSearchParams} from "react-router";
import {useProjectById} from "@/hook/useProjects.ts";
import '@/assets/styles/project-detail.css';
import ProjectHeader from "@/components/project-detail/ProjectHeader.tsx";
import ProjectTabs from "@/components/project-detail/ProjectTabs.tsx";
import ProjectStats from "@/components/project-detail/ProjectStats.tsx";
import GuestsSection from "@/components/project-detail/GuestsSection.tsx";
import TablesSection from "@/components/project-detail/TablesSection.tsx";
import QRCodeSection from "@/components/project-detail/QRCodeSection.tsx";

const ProjectDetailPage = () => {
    const {id} = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const { project, loading, error, isLoaded } = useProjectById(id);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

    const projectStats = useMemo(() => {
        if (!project) return {totalTables: 0, totalGuests: 0, placedGuests: 0, qrScans: 0};

        const totalTables = project.tables?.length || 0;
        const totalGuests = project.guests?.length || 0;
        const placedGuests = project.guests?.filter(g => g.tableId).length || 0;
        const qrScans = 0;

        return {totalTables, totalGuests, placedGuests, qrScans};
    }, [project]);

    const filteredGuests = useMemo(() => {
        if (!project?.guests) return [];

        let filtered = project.guests;

        if (searchTerm) {
            filtered = filtered.filter(guest =>
                `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedFilter === 'placed') {
            filtered = filtered.filter(guest => guest.tableId);
        } else if (selectedFilter === 'unplaced') {
            filtered = filtered.filter(guest => !guest.tableId);
        }

        return filtered;
    }, [project?.guests, searchTerm, selectedFilter]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab as string);
        }
    }, [searchParams]);

    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', activeTab);
        window.history.replaceState({}, '', url.toString());
    }, [activeTab]);

    if (loading || !isLoaded) {
        return (
            <div className="project-detail-container">
                <div className="project-loading">
                    <p>Chargement du projet...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="project-detail-container">
                <div className="project-loading">
                    <p>{error || 'Projet non trouvé'}</p>
                    <Link to="/dashboard" className="mt-4 text-primary">
                        ← Retour au dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="tab-content">
                        <ProjectStats
                            project={project}
                            stats={projectStats}
                        />
                    </div>
                );
            case 'guests':
                return (
                    <div className="tab-content">
                        <GuestsSection
                            guests={filteredGuests}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            selectedFilter={selectedFilter}
                            onFilterChange={setSelectedFilter}
                            tables={project.tables || []}
                        />
                    </div>
                );
            case 'tables':
                return (
                    <div className="tab-content">
                        <TablesSection
                            tables={project.tables || []}
                            guests={project.guests || []}
                        />
                    </div>
                );
            case 'qrcode':
                return (
                    <div className="tab-content">
                        <QRCodeSection
                            project={project}
                            qrScans={projectStats.qrScans}
                        />
                    </div>
                );
            default:
                return null;
        }
    };



    return (
        <div className="project-detail-container">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <Link to="/dashboard" className="breadcrumb-link">
                    Dashboard
                </Link>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-current">Mes projets</span>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-current">{project.name}</span>
            </div>

            {/* Header */}
            <ProjectHeader
                project={project}
            />

            {/* Tabs */}
            <ProjectTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            {renderTabContent()}
        </div>
    );
};

export default ProjectDetailPage;