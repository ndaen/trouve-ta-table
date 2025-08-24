import FilterChips, { type FilterChip } from "@/components/ui/FilterChips.tsx";

interface FiltersProps {
    activeFilter: string;
    setActiveFilter: (filter: string) => void;
}

const Filters = ({activeFilter, setActiveFilter}: FiltersProps) => {
    const filterChips: FilterChip[] = [
        { id: 'all', label: 'Tous' },
        { id: 'incoming', label: 'À venir' },
        { id: 'finished', label: 'Terminés' }
    ];

    return (
        <FilterChips 
            chips={filterChips}
            activeChip={activeFilter}
            onChipClick={setActiveFilter}
        />
    );
};

export default Filters;