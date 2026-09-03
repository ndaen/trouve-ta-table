import {useEffect, useState} from "react";
import {DynamicIcon} from "lucide-react/dynamic";

const demo = [
    {name: 'Camille Dupont', table: 'Les Cyprès'},
    {name: 'Théo Bernard', table: 'Les Figuiers'},
    {name: 'Nour Garcia', table: 'Les Oliviers'},
];

/** Tape le nom lettre à lettre, montre la table, efface, passe au suivant. */
function useTypedDemo() {
    const [index, setIndex] = useState(0);
    const [typed, setTyped] = useState('');
    const [found, setFound] = useState(false);

    useEffect(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const target = demo[index].name;
        if (reduced) {
            setTyped(target);
            setFound(true);
            return;
        }
        let timer: number;
        if (typed.length < target.length) {
            timer = window.setTimeout(() => setTyped(target.slice(0, typed.length + 1)), 70 + Math.random() * 60);
        } else if (!found) {
            timer = window.setTimeout(() => setFound(true), 350);
        } else {
            timer = window.setTimeout(() => {
                setFound(false);
                setTyped('');
                setIndex((i) => (i + 1) % demo.length);
            }, 2200);
        }
        return () => window.clearTimeout(timer);
    }, [typed, found, index]);

    return {typed, found, table: demo[index].table};
}

export default function PhoneDemo() {
    const {typed, found, table} = useTypedDemo();
    return (
        <div className="dv-device" aria-hidden="true">
            <div className="dv-device-screen">
                <p className="dv-device-title">Trouve ta table</p>
                <p className="dv-device-hint">Entrez votre nom</p>
                <div className="dv-device-input">
                    <span>{typed}</span>
                    <span className="dv-caret"/>
                </div>
                <div className={`dv-device-result ${found ? 'is-found' : ''}`}>
                    <DynamicIcon name="armchair" size={18}/>
                    <span>Table <strong>{table}</strong></span>
                </div>
            </div>
        </div>
    );
}
