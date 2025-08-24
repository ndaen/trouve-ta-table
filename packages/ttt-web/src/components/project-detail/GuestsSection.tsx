import type {Guest} from "@/types/guest.types.ts";
import type {Table} from "@/types/table.types.ts";
import {Badge, Button, FilterChips, SearchInput, TableComponent} from "@/components/ui";
import {type FilterChip} from "@/components/ui/FilterChips";
import {type TableColumn} from "@/components/ui/TableComponent";
import {DynamicIcon} from "lucide-react/dynamic";

interface GuestsSectionProps {
    guests: Guest[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedFilter: string;
    onFilterChange: (filterId: string) => void;
    tables: Table[];
}

export default function GuestsSection({
                                          guests,
                                          searchTerm,
                                          onSearchChange,
                                          selectedFilter,
                                          onFilterChange,
                                          tables
                                      }: GuestsSectionProps) {

    const filterChips: FilterChip[] = [
        {id: 'all', label: 'Tous'},
        {id: 'placed', label: 'Placés'},
        {id: 'unplaced', label: 'Non placés'},
    ];

    const getTableName = (tableId: string | null | undefined) => {
        if (!tableId) return 'Non assigné';
        const table = tables.find(t => t.id === tableId);
        return table ? table.name : 'Table inconnue';
    };

    const columns: TableColumn<Guest>[] = [
        {
            id: 'name',
            label: 'Nom',
            width: '30%',
            render: (_, guest) => (
                <div className="guest-info">
                    <span className="guest-name">{guest.firstName} {guest.lastName}</span>
                    {guest.email && (
                        <span className="guest-email">{guest.email}</span>
                    )}
                </div>
            )
        },
        {
            id: 'tableId',
            label: 'Table',
            width: '25%',
            render: (_, guest) => (
                <span className={guest.tableId ? '' : 'text-muted'}>
                    {getTableName(guest.tableId)}
                </span>
            )
        },
        {
            id: 'dietaryRequirements',
            label: 'Régime alimentaire',
            width: '25%',
            render: (_, guest) => (
                guest.dietaryRequirements ? (
                    <Badge variant="badge-secondary">
                        {guest.dietaryRequirements}
                    </Badge>
                ) : (
                    <span className="text-muted text-sm">Aucun</span>
                )
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            width: '20%',
            render: (_, guest) => (
                <Button
                    variant="btn-outline"
                    size="sm"
                    onClick={() => {/* TODO: Implement assign table */
                    }}
                >
                    <DynamicIcon name="users" size={14}/>
                    {guest.tableId ? 'Réassigner' : 'Assigner'}
                </Button>
            )
        }
    ];

    return (
        <div className="guests-section">
            <div className="guests-controls">
                <div className="guests-search">
                    <SearchInput
                        placeholder="Rechercher un invité..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>

                <FilterChips
                    chips={filterChips}
                    activeChip={selectedFilter}
                    onChipClick={onFilterChange}
                />
            </div>

            <TableComponent
                columns={columns}
                data={guests}
                pagination={{
                    enabled: true,
                    pageSize: 10,
                    showInfo: true
                }}
            />

            {guests.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <DynamicIcon name="user-plus" size={48}/>
                    </div>
                    <h4 className="empty-state-title">Aucun invité trouvé</h4>
                    <p className="empty-state-description">
                        {searchTerm
                            ? `Aucun invité ne correspond à "${searchTerm}"`
                            : 'Commencez par ajouter des invités à votre projet'
                        }
                    </p>
                    <Button variant="btn-primary">
                        <DynamicIcon name="plus" size={16}/>
                        Ajouter un invité
                    </Button>
                </div>
            )}
        </div>
    );
}