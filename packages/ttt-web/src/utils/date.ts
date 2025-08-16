

export function formatDate(dateString: string, options = {}) {
    const defaultOptions = {
        locale: 'fr-FR',
        format: 'complete',
        customFormat: null,
        timezone: 'Europe/Paris'
    };

    const config = { ...defaultOptions, ...options };

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            throw new Error('Date invalide');
        }

        switch (config.format) {
            case 'short':
                return date.toLocaleDateString(config.locale);

            case 'medium':
                return date.toLocaleDateString(config.locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

            case 'long':
                return date.toLocaleDateString(config.locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

            case 'complete':
                return date.toLocaleDateString(config.locale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

            case 'with-time':
                return date.toLocaleString(config.locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: config.timezone
                });

            case 'custom':
                if (config.customFormat) {
                    return date.toLocaleDateString(config.locale, config.customFormat);
                }
                return date.toLocaleDateString(config.locale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

            default:
                return date.toLocaleDateString(config.locale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
        }

    } catch (error) {
        console.error('Erreur lors du formatage de la date:', error);
        return 'Date invalide';
    }
}