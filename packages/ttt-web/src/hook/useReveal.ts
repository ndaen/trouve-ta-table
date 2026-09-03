import {useEffect, useRef} from "react";

/**
 * Ajoute la classe `is-visible` quand l'élément entre dans le viewport.
 * Pilote les apparitions au scroll en CSS pur, une seule fois par élément.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.2) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            node.classList.add('is-visible');
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                node.classList.add('is-visible');
                observer.disconnect();
            }
        }, {threshold});
        observer.observe(node);
        return () => observer.disconnect();
    }, [threshold]);

    return ref;
}
