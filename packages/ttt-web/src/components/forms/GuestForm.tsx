import { Input } from "@/components/ui/inputs/Input";
import { Select } from "@/components/ui/inputs/Select";
import { type FormEvent, useEffect, useState } from "react";
import Button from "@/components/ui/buttons/Button";
import ButtonIcon from "@/components/ui/buttons/ButtonIcon";
import Modal from "@/components/ui/modals/Modal";
import TableForm from "@/components/forms/TableForm";
import { type CreateGuestInput, CreateGuestSchema, DIETARY_REQUIREMENTS_OPTIONS } from "@/schemas/guestSchemas";
import { type CreateTableInput } from "@/schemas/tableSchemas";
import type { Table } from "@/types/table.types";
import { z } from "zod";

interface GuestFormProps {
    mode: 'create' | 'edit';
    initialData?: Partial<CreateGuestInput>;
    onSubmit: (data: CreateGuestInput) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    tables: Table[];
    onCreateTable?: (data: CreateTableInput) => Promise<void>;
}

export default function GuestForm({
    mode,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    tables,
    onCreateTable
}: GuestFormProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [isCreatingTable, setIsCreatingTable] = useState(false);
    const [formData, setFormData] = useState<CreateGuestInput>({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        email: initialData?.email || '',
        dietary_requirements: initialData?.dietary_requirements || '',
        tableId: initialData?.tableId || null
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        try {
            const validatedData = CreateGuestSchema.parse(formData);
            await onSubmit(validatedData);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formErrors: Record<string, string> = {};
                error.issues.forEach((issue) => {
                    if (issue.path[0]) {
                        formErrors[issue.path[0] as string] = issue.message;
                    }
                });
                setErrors(formErrors);
            } else {
                throw error;
            }
        }
    };

    const handleCreateTable = async (tableData: CreateTableInput) => {
        if (!onCreateTable) return;
        
        try {
            setIsCreatingTable(true);
            await onCreateTable(tableData);
            setIsTableModalOpen(false);
        } catch (error) {
            throw error;
        } finally {
            setIsCreatingTable(false);
        }
    };

    const updateField = (field: keyof CreateGuestInput, value: string | null) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                email: initialData.email || '',
                dietary_requirements: initialData.dietary_requirements || '',
                tableId: initialData.tableId || null
            });
        }
    }, [initialData]);

    const tableOptions = [
        { value: '', label: 'Aucune table' },
        ...tables.map(table => ({
            value: table.id,
            label: `${table.name} (${table.capacity} places)`,
            icon: 'layout-grid' as const
        }))
    ];

    return (
        <>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-row">
                    <Input
                        id="guest-first-name"
                        label="Prénom"
                        value={formData.firstName}
                        onChange={(value) => updateField('firstName', value)}
                        placeholder="Marie"
                        leftIcon="user"
                        required
                        error={errors.firstName}
                        autoComplete="given-name"
                    />

                    <Input
                        id="guest-last-name"
                        label="Nom"
                        value={formData.lastName}
                        onChange={(value) => updateField('lastName', value)}
                        placeholder="Dupont"
                        leftIcon="user"
                        required
                        error={errors.lastName}
                        autoComplete="family-name"
                    />
                </div>

                <div className="form-row">
                    <Input
                        id="guest-email"
                        label="Email (optionnel)"
                        value={formData.email || ''}
                        onChange={(value) => updateField('email', value || null)}
                        placeholder="marie.dupont@example.com"
                        leftIcon="mail"
                        type="email"
                        error={errors.email}
                        autoComplete="email"
                    />

                    <Select
                        id="guest-dietary-requirements"
                        label="Régime alimentaire (optionnel)"
                        value={formData.dietary_requirements || ''}
                        onChange={(value) => updateField('dietary_requirements', value || null)}
                        options={DIETARY_REQUIREMENTS_OPTIONS}
                        error={errors.dietary_requirements}
                    />
                </div>

                <div className="form-row">
                    <div className="input-container" style={{ flex: 1 }}>
                        <label htmlFor="guest-table" className="input-label">
                            Table (optionnel)
                        </label>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <div style={{ flex: 1 }}>
                                <Select
                                    id="guest-table"
                                    value={formData.tableId || ''}
                                    onChange={(value) => updateField('tableId', value || null)}
                                    options={tableOptions}
                                    error={errors.tableId}
                                />
                            </div>
                            {onCreateTable && (
                                <ButtonIcon
                                    icon="plus"
                                    variant="btn-outline"
                                    title="Ajouter une table"
                                    onClick={() => setIsTableModalOpen(true)}
                                    size="default"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                    {onCancel && (
                        <Button
                            variant="btn-outline"
                            onClick={onCancel}
                            type="button"
                            disabled={isLoading}
                        >
                            Annuler
                        </Button>
                    )}
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        {mode === 'create' ? 'Ajouter l\'invité' : 'Modifier l\'invité'}
                    </Button>
                </div>
            </form>

            {onCreateTable && (
                <Modal
                    isOpen={isTableModalOpen}
                    onClose={() => setIsTableModalOpen(false)}
                    header={<h3>Ajouter une table</h3>}
                    body={
                        <TableForm
                            mode="create"
                            onSubmit={handleCreateTable}
                            onCancel={() => setIsTableModalOpen(false)}
                            isLoading={isCreatingTable}
                        />
                    }
                    size="md"
                />
            )}
        </>
    );
}