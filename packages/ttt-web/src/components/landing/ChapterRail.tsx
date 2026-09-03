import {useEffect, useState, type CSSProperties} from "react";

interface ChapterRailProps {
    /** Identifiants des sections, dans l'ordre du récit. */
    chapters: { id: string; label: string }[];
}

/**
 * Rail collant qui suit la lecture : la ligne se remplit au fil du scroll
 * et l'étape courante passe en avant. Cliquer sur une étape y amène.
 */
export default function ChapterRail({chapters}: ChapterRailProps) {
    const [progress, setProgress] = useState(0);
    const [active, setActive] = useState(0);

    useEffect(() => {
        const nodes = chapters
            .map((c) => document.getElementById(c.id))
            .filter((n): n is HTMLElement => n !== null);
        if (nodes.length === 0) return;

        const update = () => {
            // Tout se mesure au centre de l'écran : c'est là que l'œil lit.
            const center = window.scrollY + window.innerHeight / 2;
            const start = nodes[0].offsetTop;
            const last = nodes[nodes.length - 1];
            const end = last.offsetTop + last.offsetHeight;
            setProgress(Math.min(1, Math.max(0, (center - start) / (end - start))));

            let current = 0;
            nodes.forEach((n, i) => {
                if (center >= n.offsetTop) current = i;
            });
            setActive(current);
        };

        update();
        window.addEventListener('scroll', update, {passive: true});
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, [chapters]);

    return (
        <nav className={`dv-rail ${progress >= 1 ? 'is-finished' : ''}`} aria-label="Progression du récit">
            <div className="dv-rail-track">
                <div className="dv-rail-fill" style={{'--p': progress} as CSSProperties}/>
            </div>
            <ol className="dv-rail-steps">
                {chapters.map((c, i) => (
                    <li key={c.id}>
                        <a href={`#${c.id}`}
                           className={`dv-rail-step ${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}`}
                           aria-current={i === active ? 'step' : undefined}>
                            {c.label}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
