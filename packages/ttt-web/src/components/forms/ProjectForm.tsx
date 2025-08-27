import { Input } from "@/components/ui/inputs/Input";
import { Select } from "@/components/ui/inputs/Select";
import { DatePicker } from "@/components/ui/inputs/DatePicker";
import { CityAutocomplete } from "@/components/ui/inputs/CityAutocomplete";
import { type FormEvent, useEffect, useState } from "react";
import Button from "@/components/ui/buttons/Button";
import { type CreateProjectInput, CreateProjectSchema, EVENT_TYPE_OPTIONS } from "@/schemas/projectSchemas";
import { z } from "zod";

interface ProjectFormProps {
    mode: 'create' | 'edit';
    initialData?: Partial<CreateProjectInput>;
    onSubmit: (data: CreateProjectInput) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
}

export default function ProjectForm({
    mode,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false
}: ProjectFormProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<CreateProjectInput>({
        name: initialData?.name || '',
        eventType: initialData?.eventType || 'wedding',
        eventDate: initialData?.eventDate || '',
        venue: initialData?.venue || '',
        description: initialData?.description || ''
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        try {
            const validatedData = CreateProjectSchema.parse(formData);
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

    const updateField = (field: keyof CreateProjectInput, value: string) => {
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
                eventType: initialData.eventType || 'wedding',
                eventDate: initialData.eventDate || '',
                venue: initialData.venue || '',
                description: initialData.description || ''
            });
        }
    }, [initialData]);

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-row">
                <Input
                    id="project-name"
                    label="Nom de l'événement"
                    value={formData.name}
                    onChange={(value) => updateField('name', value)}
                    placeholder="Mariage de Julie & Pierre"
                    leftIcon="calendar"
                    required
                    error={errors.name}
                    autoComplete="off"
                />

                <Select
                    id="project-event-type"
                    label="Type d'événement"
                    value={formData.eventType}
                    onChange={(value) => updateField('eventType', value as CreateProjectInput['eventType'])}
                    options={EVENT_TYPE_OPTIONS}
                    required
                    error={errors.eventType}
                />
            </div>

            <div className="form-row">
                <DatePicker
                    id="project-event-date"
                    label="Date de l'événement"
                    value={formData.eventDate}
                    onChange={(value) => updateField('eventDate', value)}
                    required
                    error={errors.eventDate}
                />

                <CityAutocomplete
                    id="project-venue"
                    label="Lieu"
                    value={formData.venue}
                    onChange={(value) => updateField('venue', value)}
                    placeholder="Rechercher une ville..."
                    required
                    error={errors.venue}
                />
            </div>

            <div className="input-container">
                <label htmlFor="project-description" className="input-label">
                    Description (optionnel)
                </label>
                <div className="input-wrapper">
                    <textarea
                        id="project-description"
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Décrivez votre événement..."
                        className="input"
                        style={{
                            height: '80px',
                            resize: 'vertical',
                            minHeight: '80px',
                            maxHeight: '200px',
                            paddingTop: 'var(--space-3)',
                            paddingBottom: 'var(--space-3)',
                            lineHeight: 'var(--leading-normal)'
                        }}
                        maxLength={500}
                    />
                </div>
                {formData.description && (
                    <div style={{ 
                        fontSize: 'var(--text-sm)', 
                        color: 'var(--muted-foreground)', 
                        textAlign: 'right', 
                        marginTop: 'var(--space-1)' 
                    }}>
                        {formData.description.length}/500
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
                    {mode === 'create' ? 'Créer l\'événement' : 'Modifier l\'événement'}
                </Button>
            </div>
        </form>
    );
}