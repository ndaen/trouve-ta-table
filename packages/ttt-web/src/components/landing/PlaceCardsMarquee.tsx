const names = [
    ['Camille Dupont', 'Les Cyprès'], ['Inès Martin', 'Les Oliviers'], ['Théo Bernard', 'Les Figuiers'],
    ['Lucas Petit', 'Les Amandiers'], ['Léa Moreau', 'Les Lauriers'], ['Nour Garcia', 'Les Cyprès'],
    ['Hugo Roux', 'Les Oliviers'], ['Jade Fournier', 'Les Figuiers'], ['Adam Girard', 'Les Amandiers'],
    ['Emma Lambert', 'Les Lauriers'], ['Sacha Bonnet', 'Les Cyprès'], ['Zoé Mercier', 'Les Oliviers'],
];

export default function Marquee({reverse = false}: { reverse?: boolean }) {
    const row = [...names, ...names];
    return (
        <div className={`dv-marquee ${reverse ? 'is-reverse' : ''}`} aria-hidden="true">
            <div className="dv-marquee-track">
                {row.map(([n, t], i) => (
                    <span key={i} className="dv-place-card">
                        <span className="dv-place-name">{n}</span>
                        <span className="dv-place-table">{t}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

