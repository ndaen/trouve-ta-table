import type {CSSProperties} from "react";

const tables = [
    {cx: 90, cy: 80, name: 'Les Cyprès', seats: 8, filled: 8},
    {cx: 250, cy: 60, name: 'Les Oliviers', seats: 8, filled: 6},
    {cx: 410, cy: 90, name: 'Les Figuiers', seats: 6, filled: 6},
    {cx: 150, cy: 220, name: 'Les Amandiers', seats: 10, filled: 7},
    {cx: 340, cy: 230, name: 'Les Lauriers', seats: 8, filled: 3},
];

function Table({cx, cy, name, seats, filled, index}: typeof tables[number] & { index: number }) {
    const r = 34;
    const seatR = 52;
    return (
        <g className="dv-plan-table" style={{'--i': index} as CSSProperties}>
            <circle cx={cx} cy={cy} r={r} className="dv-plan-top"/>
            {Array.from({length: seats}).map((_, s) => {
                const a = (s / seats) * Math.PI * 2 - Math.PI / 2;
                return (
                    <circle
                        key={s}
                        cx={cx + Math.cos(a) * seatR}
                        cy={cy + Math.sin(a) * seatR}
                        r={7}
                        className={`dv-plan-seat ${s < filled ? 'is-filled' : ''}`}
                        style={{'--s': index * seats + s} as CSSProperties}
                    />
                );
            })}
            <text x={cx} y={cy + 4} textAnchor="middle" className="dv-plan-label">{name}</text>
        </g>
    );
}

export default function SeatingPlan() {
    return (
        <svg className="dv-plan-svg" viewBox="0 0 500 320" role="img"
             aria-label="Plan de salle avec cinq tables rondes qui se remplissent">
            {tables.map((t, i) => <Table key={t.name} {...t} index={i}/>)}
        </svg>
    );
}
