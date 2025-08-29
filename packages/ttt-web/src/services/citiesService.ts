export interface City {
    name: string;
    country: string;
    display: string;
    lat?: number;
    lng?: number;
}

class CitiesService {
    private cache = new Map<string, City[]>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    constructor() {
        // No longer need constructor initialization
    }

    /**
     * Search for cities using API
     * @param query - Search query
     * @param limit - Maximum number of results (default: 8)
     * @returns Promise with array of matching cities
     */
    public async searchCities(query: string, limit: number = 8): Promise<City[]> {
        if (!query || query.length < 2) {
            return [];
        }

        const cacheKey = `${query.toLowerCase()}_${limit}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (cached) return cached;
        }

        try {
            // Use OpenDataSoft's World Cities API (gratuite, pas de clé nécessaire)
            const response = await fetch(
                `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=${encodeURIComponent(query)}&rows=${limit}&sort=population&facet=country`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            const cities: City[] = data.records.map((record: { fields: { name: string; cou_name_en: string; coordinates?: [number, number] } }) => ({
                name: record.fields.name,
                country: record.fields.cou_name_en,
                display: `${record.fields.name}, ${record.fields.cou_name_en}`,
                lat: record.fields.coordinates?.[0],
                lng: record.fields.coordinates?.[1]
            }));

            // Cache the results
            this.cache.set(cacheKey, cities);
            
            // Clear cache after duration
            setTimeout(() => {
                this.cache.delete(cacheKey);
            }, this.CACHE_DURATION);

            return cities;
        } catch (error) {
            console.error('Error searching cities:', error);
            // Fallback to popular cities if API fails
            return this.getFallbackCities(query, limit);
        }
    }

    /**
     * Fallback cities when API fails
     */
    private getFallbackCities(query: string, limit: number): City[] {
        const popularCities: City[] = [
            { name: "Paris", country: "France", display: "Paris, France" },
            { name: "Lyon", country: "France", display: "Lyon, France" },
            { name: "Marseille", country: "France", display: "Marseille, France" },
            { name: "Toulouse", country: "France", display: "Toulouse, France" },
            { name: "Nice", country: "France", display: "Nice, France" },
            { name: "Nantes", country: "France", display: "Nantes, France" },
            { name: "Bordeaux", country: "France", display: "Bordeaux, France" },
            { name: "Lille", country: "France", display: "Lille, France" },
            { name: "London", country: "United Kingdom", display: "London, United Kingdom" },
            { name: "Barcelona", country: "Spain", display: "Barcelona, Spain" },
            { name: "Madrid", country: "Spain", display: "Madrid, Spain" },
            { name: "Rome", country: "Italy", display: "Rome, Italy" },
            { name: "Berlin", country: "Germany", display: "Berlin, Germany" },
            { name: "Amsterdam", country: "Netherlands", display: "Amsterdam, Netherlands" },
        ];

        const searchTerm = query.toLowerCase();
        return popularCities
            .filter(city => 
                city.name.toLowerCase().includes(searchTerm) ||
                city.country.toLowerCase().includes(searchTerm)
            )
            .slice(0, limit);
    }
}

// Export singleton instance
export const citiesService = new CitiesService();
export default citiesService;