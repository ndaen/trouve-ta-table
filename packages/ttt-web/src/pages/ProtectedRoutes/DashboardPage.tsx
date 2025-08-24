import {useProjects} from "@/hook/useProjects.ts";
import {useToast} from "@/stores/useToastStore.ts";
import ProjectCard from "@/components/dashboard/ProjectCard.tsx";
import '@/assets/styles/dashboard/dashboard.css'
import Card from "@/components/ui/cards/Card.tsx";
import ButtonIcon from "@/components/ui/buttons/ButtonIcon.tsx";
import type {IconName} from "lucide-react/dynamic";
import {useState} from "react";
import Filters from "@/components/dashboard/Filters.tsx";
import Button from "@/components/ui/buttons/Button.tsx";

type newProjectCard = {
    icon: IconName,
    title: string,
    description: string,
    actions: () => void
}

const DashboardPage = () => {
    const {projects, loading, error} = useProjects();
    const toast = useToast();
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
            actions: () => toast.info('Actions pour Nouveau Mariage')
        },
        {
            icon: 'cake',
            title: 'Anniversaire',
            description: 'Célébrez en beauté',
            actions: () => toast.info('Actions pour Anniversaire')
        },
        {
            icon: 'building-2',
            title: 'Événement Pro',
            description: 'Réunions et conférences',
            actions: () => toast.info('Actions pour Événement Pro')
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
                                    <ButtonIcon variant={'btn-secondary'} icon={pCard.icon} iconSize={18}/>
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
                            <Button variant={'btn-secondary'} icon={'plus'}>Créer un projet</Button>
                        </div>
                    </div>
                    <div className={'project-card-grid'}>
                        {filterProjects(activeFilter).map((project, index) => (
                            <ProjectCard key={index} project={project}/>
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
                        <Button variant={'btn-primary'} icon={'plus'} onClick={() => toast.info('Créer un projet')}>
                            Créer un projet
                        </Button>
                    </div>
                </div>

            }

        </div>
    );
};

export default DashboardPage;