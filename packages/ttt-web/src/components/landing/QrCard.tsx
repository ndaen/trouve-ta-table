import type {CSSProperties} from "react";

const SIZE = 21;

/** Générateur déterministe : la même grille à chaque rendu, sans dépendance. */
function bit(x: number, y: number) {
    let h = (x * 73856093) ^ (y * 19349663);
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) & 1) === 1;
}

function inFinder(x: number, y: number) {
    const zones = [[0, 0], [SIZE - 7, 0], [0, SIZE - 7]];
    return zones.some(([ox, oy]) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7);
}

function finderDark(x: number, y: number) {
    const zones = [[0, 0], [SIZE - 7, 0], [0, SIZE - 7]];
    for (const [ox, oy] of zones) {
        const lx = x - ox, ly = y - oy;
        if (lx < 0 || lx > 6 || ly < 0 || ly > 6) continue;
        const ring = lx === 0 || lx === 6 || ly === 0 || ly === 6;
        const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
        return ring || core;
    }
    return false;
}

/** Un carton d'invitation avec un motif façon QR code qui se dessine. Décoratif. */
export default function QrCard() {
    const cells: { x: number; y: number }[] = [];
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const dark = inFinder(x, y) ? finderDark(x, y) : bit(x, y);
            if (dark) cells.push({x, y});
        }
    }
    return (
        <div className="dv-qr-card" aria-hidden="true">
            <p className="dv-qr-names">Camille &amp; Théo</p>
            <svg className="dv-qr" viewBox={`0 0 ${SIZE} ${SIZE}`} shapeRendering="crispEdges">
                {cells.map(({x, y}, i) => (
                    <rect key={i} x={x} y={y} width={1} height={1}
                          style={{'--d': (x + y) / (SIZE * 2)} as CSSProperties}/>
                ))}
            </svg>
            <p className="dv-qr-hint">Scannez pour trouver votre table</p>
        </div>
    );
}
