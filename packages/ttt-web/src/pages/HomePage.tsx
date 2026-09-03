import {useNavigate} from "react-router";
import {DynamicIcon} from "lucide-react/dynamic";
import Button from "@/components/ui/buttons/Button.tsx";
import {useReveal} from "@/hook/useReveal.ts";
import SeatingPlan from "@/components/landing/SeatingPlan.tsx";
import Marquee from "@/components/landing/PlaceCardsMarquee.tsx";
import QrCard from "@/components/landing/QrCard.tsx";
import PhoneDemo from "@/components/landing/PhoneDemo.tsx";
import ChapterRail from "@/components/landing/ChapterRail.tsx";
import '@/assets/styles/landing.css';

const chapters = [
    {id: 'avant', label: 'Avant'},
    {id: 'la-veille', label: 'La veille'},
    {id: 'le-jour-j', label: 'Le jour J'},
];

export default function HomePage() {
    const navigate = useNavigate();
    const plan = useReveal<HTMLElement>(0.15);
    const qr = useReveal<HTMLElement>(0.15);
    const day = useReveal<HTMLElement>(0.15);
    const cta = useReveal<HTMLElement>();

    return (
        <main className="dv dv-full">
            {/* Hero : la promesse, et le plan qui se remplit */}
            <section className="dv-plan-hero">
                <div className="dv-plan-copy">
                    <p className="dv-eyebrow">Plan de table pour votre mariage</p>
                    <h1 className="dv-plan-title">
                        <span className="dv-line">Vous placez.</span>
                        <span className="dv-line">Ils scannent.</span>
                        <span className="dv-line dv-line-accent">Tout le monde s'assoit.</span>
                    </h1>
                    <p className="dv-lead">
                        Composez vos tables pendant des semaines, changez d'avis autant qu'il faut.
                        Le jour J, chaque invité tape son nom sur son téléphone et trouve sa place.
                    </p>
                    <div className="dv-actions">
                        <Button size="lg" variant="btn-secondary" onClick={() => navigate('/auth?tab=register')}>
                            Créer mon plan de table
                        </Button>
                        <Button size="lg" variant="btn-ghost" onClick={() => navigate('/auth')}>
                            J'ai déjà un compte
                        </Button>
                    </div>
                    <p className="dv-note">Gratuit. Aucune carte bancaire demandée.</p>
                </div>
                <SeatingPlan/>
            </section>

            <ChapterRail chapters={chapters}/>

            {/* 1. Avant : le plan de table */}
            <section id="avant" ref={plan} className="dv-reveal dv-chapter">
                <div className="dv-chapter-head">
                    <p className="dv-eyebrow">Avant · pour les mariés</p>
                    <h2>Un plan qui accepte que vous changiez d'avis</h2>
                    <p className="dv-chapter-lead">
                        Une table, c'est un nom et une capacité. Vous y glissez vos proches, vous notez qui
                        ne mange pas de viande, et vous déplacez qui vous voulez jusqu'à la veille.
                    </p>
                </div>
                <div className="dv-marquees">
                    <Marquee/>
                    <Marquee reverse/>
                </div>
                <ul className="dv-chapter-points">
                    <li><DynamicIcon name="armchair" size={18}/> Le plein et le libre se voient d'un coup d'œil</li>
                    <li><DynamicIcon name="leaf" size={18}/> Régimes et allergies notés sur chaque invité</li>
                    <li><DynamicIcon name="history" size={18}/> Revenez-y pendant des semaines, rien ne se perd</li>
                </ul>
            </section>

            {/* 2. La veille : le QR code */}
            <section id="la-veille" ref={qr} className="dv-reveal dv-chapter dv-chapter-qr">
                <div className="dv-chapter-head">
                    <p className="dv-eyebrow">La veille · pour les mariés <span className="dv-soon">Bientôt</span></p>
                    <h2>Un QR code à poser à l'entrée</h2>
                    <p className="dv-chapter-lead">
                        Imprimez-le sur un carton, un chevalet ou le menu. Il ouvre la page de recherche de
                        votre mariage, et rien d'autre. Pas d'application à installer pour vos invités.
                    </p>
                </div>
                <QrCard/>
            </section>

            {/* 3. Le jour J : le téléphone */}
            <section id="le-jour-j" ref={day} className="dv-reveal dv-phone-hero dv-chapter-day">
                <div className="dv-phone-copy">
                    <p className="dv-eyebrow dv-eyebrow-light">Le jour J · pour les invités</p>
                    <h2 className="dv-phone-title">
                        Ils tapent leur nom.<br/>Ils s'assoient.
                    </h2>
                    <p className="dv-lead dv-lead-light">
                        Pas de liste à l'entrée, pas de plan affiché qu'on lit à dix. Même avec un réseau
                        saturé et cent vingt personnes qui scannent en même temps.
                    </p>
                </div>
                <PhoneDemo/>
            </section>

            <section ref={cta} className="dv-reveal dv-plan-cta">
                <h2>Votre plan vous attend.</h2>
                <Button size="lg" variant="btn-secondary" icon="arrow-right"
                        onClick={() => navigate('/auth?tab=register')}>
                    Commencer mon plan de table
                </Button>
            </section>
        </main>
    );
}
