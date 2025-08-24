import Button from "./buttons/Button";

export interface FilterChip {
    id: string;
    label: string;
    value?: string | number;
}

interface FilterChipsProps {
    chips: FilterChip[];
    activeChip?: string;
    onChipClick: (chipId: string) => void;
    className?: string;
}

export default function FilterChips({
                                        chips,
                                        activeChip,
                                        onChipClick,
                                        className = ''
                                    }: FilterChipsProps) {
    return (
        <div className={`flex gap-2 ${className}`}>
            {chips.map((chip) => (
                <Button
                    key={chip.id}
                    variant={activeChip === chip.id ? 'btn-secondary' : 'btn-outline'}
                    size="sm"
                    onClick={() => onChipClick(chip.id)}
                    aria-label={`Filtrer par ${chip.label}`}
                    aria-pressed={activeChip === chip.id}
                >
                    {chip.label}
                    {chip.value !== undefined && (
                        <span className="ml-1 px-1 rounded text-xs">
                            {chip.value}
                        </span>
                    )}
                </Button>
            ))}
        </div>
    );
}