import {useProjects} from "@/hook/useProjects.ts";
import { useProjectsStore } from "@/stores/useProjectsStore";
import {useToast} from "@/stores/useToastStore.ts";
import ProjectCard from "@/components/dashboard/ProjectCard.tsx";
import '@/assets/styles/dashboard/dashboard.css'
import Card from "@/components/ui/cards/Card.tsx";
import ButtonIcon from "@/components/ui/buttons/ButtonIcon.tsx";
import type {IconName} from "lucide-react/dynamic";
import {useState} from "react";
import Filters from "@/components/dashboard/Filters.tsx";
import Button from "@/components/ui/buttons/Button.tsx";
import { useNavigate } from "react-router";

type newProjectCard = {
    icon: IconName,
    title: string,
    description: string,
    actions: () => void
}

const DashboardPage = () => {
    const {projects, loading, error} = useProjects();
    const loadProjects = useProjectsStore(state => state.loadProjects);
    const toast = useToast();
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<string>('all')

    if (loading) return <p>Loading...</p>;
    if (error) {
        toast.error(error || "An error occurred while fetching projects.");
    }

    const filterProjects = (filter: string) => {
        if (filter === 'all') {
            return projects;
        } else if (filter === 'incoming') {
            return projects.filter(project => new Date(project.eventDate) > new Date());
        } else if (filter === 'finished') {
            return projects.filter(project => new Date(project.eventDate) < new Date());
        }
        return [];
    }

    const newProjectCards: newProjectCard[] = [
        {
            icon: 'gem',
            title: 'Nouveau Mariage',
            description: 'Organisez le placement de vos invités',
            actions: () => navigate('/projects/create?type=wedding')
        },
        {
            icon: 'cake',
            title: 'Anniversaire',
            description: 'Célébrez en beauté',
            actions: () => navigate('/projects/create?type=birthday')
        },
        {
            icon: 'building-2',
            title: 'Événement Pro',
            description: 'Réunions et conférences',
            actions: () => navigate('/projects/create?type=corporate')
        }
    ]

    return (
        <div className={'dashboard-container'}>
            <div className={'dashboard-header'}>
                <h1 className={'text-center text-4xl'}>Vos projets</h1>
                <p className={'text-center text-muted text-lg'}>Créez des moments inoubliables avec des placements
                    parfaits pour vos invités</p>
                <div className={'new-project-cards'}>
                    {newProjectCards.map((pCard, index) => (
                        <Card
                            key={index}
                            header={
                                <div className={'flex items-center justify-center'}>
                                    <ButtonIcon variant={'btn-secondary'} icon={pCard.icon} size="lg"/>
                                </div>
                            }
                            body={
                                <div className={'flex flex-direction-column text-center'}>
                                    <h3>{pCard.title}</h3>
                                    <p className={'text-base text-muted'}>{pCard.description}</p>
                                </div>
                            }
                            actions={pCard.actions}
                            className={'new-project-card'}
                        />
                    ))}
                </div>

            </div>
            {projects && projects.length > 0 ?
                <div className={'dashboard-body'}>
                    <div className={'dashboard-body-header'}>
                        <h1>Mes projets</h1>
                        <div className={'flex flex-direction-row gap-2 items-center justify-between'}>
                            <Filters activeFilter={activeFilter} setActiveFilter={setActiveFilter}/>
                            <div className={'flex gap-2'}>
                                <ButtonIcon 
                                    variant={'btn-secondary'} 
                                    icon={'refresh-cw'} 
                                    onClick={() => loadProjects()}
                                    disabled={loading}
                                    title="Actualiser les projets"
                                />
                                <Button variant={'btn-secondary'} icon={'plus'} onClick={() => navigate('/projects/create')}>Créer un projet</Button>
                            </div>
                        </div>
                    </div>
                    <div className={'project-card-grid'}>
                        {filterProjects(activeFilter).map((project) => (
                            <ProjectCard key={project.id} project={project}/>
                        ))}
                    </div>
                </div>
                :
                <div className={'dashboard-body'}>
                    <div className={'dashboard-body-header'}>
                        <h1>Mes projets</h1>
                    </div>
                    <div className={'no-projects-container'}>
                        <h2 className={'text-center text-2xl'}>Aucun projet trouvé</h2>
                        <p className={'text-center text-muted'}>Créez votre premier projet pour commencer à organiser vos
                            événements.</p>
                        <Button variant={'btn-primary'} icon={'plus'} onClick={() => navigate('/projects/create')}>
                            Créer un projet
                        </Button>
                    </div>
                </div>

            }

        </div>
    );
};

export default DashboardPage;