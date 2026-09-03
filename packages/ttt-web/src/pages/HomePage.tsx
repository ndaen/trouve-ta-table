import {useNavigate} from "react-router";
import {DynamicIcon, type IconName} from "lucide-react/dynamic";
import Button from "@/components/ui/buttons/Button.tsx";
import '@/assets/styles/home.css';

const steps: { icon: IconName; title: string; text: string }[] = [
    {
        icon: 'calendar-heart',
        title: 'Créez votre mariage',
        text: 'Un nom, une date. Votre plan de table a un endroit où vivre, et vous pouvez y revenir quand vous voulez.',
    },
    {
        icon: 'armchair',
        title: 'Composez vos tables',
        text: 'Donnez un nom et une capacité à chaque table. Vous voyez d\'un coup d\'œil ce qui est plein et ce qui reste libre.',
    },
    {
        icon: 'users',
        title: 'Placez vos invités',
        text: 'Ajoutez vos proches, notez leurs régimes alimentaires, puis assignez-les à une table. Déplacez-les autant de fois qu\'il faut.',
    },
];

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <main className="home">
            <section className="home-hero">
                <p className="home-eyebrow">Plan de table pour votre mariage</p>
                <h1 className="home-title">
                    Chaque invité trouve sa place.<br/>
                    <span className="home-title-accent">Vous aussi.</span>
                </h1>
                <p className="home-lead">
                    Composez vos tables, placez vos proches, changez d'avis sans tout refaire.
                    Le jour J, vos invités tapent leur nom et découvrent leur table.
                </p>
                <div className="home-actions">
                    <Button size="lg" variant="btn-secondary" icon="heart"
                            onClick={() => navigate('/auth?tab=register')}>
                        Créer mon plan de table
                    </Button>
                    <Button size="lg" variant="btn-outline" onClick={() => navigate('/auth')}>
                        J'ai déjà un compte
                    </Button>
                </div>
                <p className="home-note">Gratuit. Aucune carte bancaire demandée.</p>
            </section>

            <section className="home-steps" aria-labelledby="home-steps-title">
                <h2 id="home-steps-title" className="home-section-title">Trois étapes, pas une de plus</h2>
                <ol className="home-steps-list">
                    {steps.map((step, index) => (
                        <li key={step.title} className="card home-step">
                            <div className="home-step-head">
                                <span className="home-step-number">{index + 1}</span>
                                <DynamicIcon name={step.icon} size={22} aria-hidden="true"/>
                            </div>
                            <h3 className="home-step-title">{step.title}</h3>
                            <p className="home-step-text">{step.text}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="home-guest" aria-labelledby="home-guest-title">
                <div className="home-guest-copy">
                    <h2 id="home-guest-title" className="home-section-title">Le jour J, personne ne cherche</h2>
                    <p className="home-guest-text">
                        Vos invités ouvrent la page de recherche de votre mariage sur leur téléphone,
                        tapent leur nom, et voient leur table. Pas de compte à créer, pas de liste
                        imprimée à parcourir à l'entrée de la salle.
                    </p>
                </div>
                <div className="card home-guest-demo" aria-hidden="true">
                    <p className="home-guest-demo-title">Trouve ta table</p>
                    <p className="home-guest-demo-hint">Entrez votre nom pour découvrir votre placement</p>
                    <div className="home-guest-demo-input">Camille Dupont</div>
                    <div className="home-guest-demo-result">
                        <DynamicIcon name="armchair" size={18}/>
                        <span>Table <strong>Les Cyprès</strong></span>
                    </div>
                </div>
            </section>

            <section className="home-cta">
                <h2 className="home-section-title">Prêts à placer tout le monde ?</h2>
                <Button size="lg" variant="btn-secondary" icon="arrow-right"
                        onClick={() => navigate('/auth?tab=register')}>
                    Commencer mon plan de table
                </Button>
            </section>
        </main>
    );
}
