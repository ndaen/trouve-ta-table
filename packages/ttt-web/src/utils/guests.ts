export const getDietaryRequirementsSummary = (dietary_requirements: string): string => {
    switch (dietary_requirements) {
        case 'vegetarian':
            return 'Végétarien';
        case 'vegan':
            return 'Végétalien';
        case 'gluten-free':
            return 'Sans gluten';
        case 'lactose-free':
            return 'Sans lactose';
        case 'halal':
            return 'Halal';
        case 'kosher':
            return 'Casher';
        case 'nut-free':
            return 'Sans noix';
        case 'other':
            return 'Autre';
        default:
            return 'Aucun';
    }
}