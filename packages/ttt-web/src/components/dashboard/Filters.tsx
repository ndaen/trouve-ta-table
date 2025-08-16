import Button from "@/components/ui/buttons/Button.tsx";

interface FiltersProps {
    activeFilter: string;
    setActiveFilter: (filter: string) => void;
}

const Filters = ({activeFilter, setActiveFilter}: FiltersProps) => {
    return (
        <div className={'dashboard-filters'}>
            <Button
                variant={activeFilter === 'all' ? 'btn-secondary' : 'btn-ghost'}
                onClick={() => setActiveFilter('all')}
            >
                Tous
            </Button>
            <Button
                variant={activeFilter === 'incoming' ? 'btn-secondary' : 'btn-ghost'}
                onClick={() => setActiveFilter('incoming')}
            >
                À venir
            </Button>
            <Button
                variant={activeFilter === 'finished' ? 'btn-secondary' : 'btn-ghost'}
                onClick={() => setActiveFilter('finished')}
            >
                Terminés
            </Button>
        </div>
    );
};

export default Filters;