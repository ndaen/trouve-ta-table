import { Input } from "@/components/ui/inputs/Input";
import { Select } from "@/components/ui/inputs/Select";
import { type FormEvent, useEffect, useState } from "react";
import Button from "@/components/ui/buttons/Button";
import { type CreateTableInput, CreateTableSchema, TABLE_CAPACITY_OPTIONS } from "@/schemas/tableSchemas";
import { z } from "zod";

interface TableFormProps {
    mode: 'create' | 'edit';
    initialData?: Partial<CreateTableInput>;
    onSubmit: (data: CreateTableInput) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
}

export default function TableForm({
    mode,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false
}: TableFormProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<CreateTableInput>({
        name: initialData?.name || '',
        capacity: initialData?.capacity || 8,
        description: initialData?.description || ''
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        try {
            const validatedData = CreateTableSchema.parse(formData);
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

    const updateField = (field: keyof CreateTableInput, value: string | number) => {
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
                name: initialData.name || '',
                capacity: initialData.capacity || 8,
                description: initialData.description || ''
            });
        }
    }, [initialData]);

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-row">
                <Input
                    id="table-name"
                    label="Nom de la table"
                    value={formData.name}
                    onChange={(value) => updateField('name', value)}
                    placeholder="Table 1, Table des mariés..."
                    leftIcon="layout-grid"
                    required
                    error={errors.name}
                    autoComplete="off"
                />

                <Select
                    id="table-capacity"
                    label="Capacité"
                    value={formData.capacity.toString()}
                    onChange={(value) => updateField('capacity', parseInt(value))}
                    options={TABLE_CAPACITY_OPTIONS.map(option => ({
                        value: option.value.toString(),
                        label: option.label,
                        icon: 'users'
                    }))}
                    required
                    error={errors.capacity}
                />
            </div>

            <div className="input-container">
                <label htmlFor="table-description" className="input-label">
                    Description (optionnel)
                </label>
                <div className="input-wrapper">
                    <textarea
                        id="table-description"
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Décrivez cette table..."
                        className="input"
                        style={{
                            height: '80px',
                            resize: 'vertical',
                            minHeight: '80px',
                            maxHeight: '150px',
                            paddingTop: 'var(--space-3)',
                            paddingBottom: 'var(--space-3)',
                            lineHeight: 'var(--leading-normal)'
                        }}
                        maxLength={200}
                    />
                </div>
                {formData.description && (
                    <div style={{ 
                        fontSize: 'var(--text-sm)', 
                        color: 'var(--muted-foreground)', 
                        textAlign: 'right', 
                        marginTop: 'var(--space-1)' 
                    }}>
                        {formData.description.length}/200
                    </div>
                )}
                {errors.description && (
                    <span style={{ 
                        color: 'var(--error)', 
                        fontSize: 'var(--text-sm)', 
                        marginTop: 'var(--space-1)' 
                    }}>
                        {errors.description}
                    </span>
                )}
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
                    {mode === 'create' ? 'Créer la table' : 'Modifier la table'}
                </Button>
            </div>
        </form>
    );
}