import Button from "@/components/buttons/Button.tsx";
import ButtonIcon from "@/components/buttons/ButtonIcon.tsx";
import Card from "@/components/cards/Card.tsx";
import Badge from "@/components/Badge.tsx";
import {Input} from "@/components/inputs/Input.tsx";
import {CopyButton} from "@/components/buttons/CopyButton.tsx";
import {useTheme} from "@/stores/themeStore.ts";
import {useState} from "react";
import {type ToastPosition, useToast} from "@/stores/useToastStore.ts";

const DesignSystemShowcase = () => {
    const {darkMode} = useTheme();
    const colourPalette = [
        {
            name: 'Arrière-plan',
            value: darkMode ? '#FFFFFF' : '#000000',
            className: 'bg-background',
            description: 'Arrière-plan principal'
        },
        {
            name: 'Premier plan',
            value: darkMode ? '#FAFAFA' : '#09090B',
            className: 'bg-foreground',
            description: 'Texte principal'
        },
        {
            name: 'Carte',
            value: darkMode ? '#080808' : '#FFFFFF',
            className: 'bg-card',
            description: 'Arrière-plan de la carte'
        },
        {
            name: 'Bordure',
            value: darkMode ? '#262626' : '#E4E4E7',
            className: 'bg-border',
            description: 'Bordures des composants',

        },
        {
            name: 'Primaire',
            value: darkMode ? '#FAFAFA' : '#E0E0E5',
            className: 'bg-primary',
            description: 'Actions principales',

        },
        {
            name: 'Secondaire',
            value: darkMode ? '#171717' : '#F4F4F5',
            className: 'bg-secondary',
            description: 'Actions secondaires',

        },
        {
            name: 'Succès',
            value: '#0D9488',
            className: 'bg-success',
            description: 'États de succès',

        },
        {
            name: 'Avertissement',
            value: '#FB923C',
            className: 'bg-warning',
            description: 'États d’avertissement',

        },
        {
            name: 'Erreur',
            value: '#BE123C',
            className: 'bg-error',
            description: 'États d’erreur',

        },
        {
            name: 'Info',
            value: '#334155',
            className: 'bg-info',
            description: 'États informatifs',

        },
    ];
    const [name, setName] = useState<string>('');
    const [position, setPosition] = useState<ToastPosition>('top-right');
    const TOAST_POSITIONS: ToastPosition[] = [ 'top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right' ];


    const toast = useToast()

    const handleSuccess = () => {
        toast.success("Invité ajouté avec succès !", {
            title: "Succès"
        })
    }

    const handleError = () => {
        toast.error("Impossible de sauvegarder les données", {
            title: "Erreur",
            duration: 0
        })
    }

    const handleWarning = () => {
        toast.warning("Cette action ne peut pas être annulée", {
            title: "Attention",
            duration: 7000
        })
    }

    const handleInfo = () => {
        toast.info("Synchronisation en cours...", {
            position: 'bottom-right'
        })
    }

    const handlePositionChange = () => {
        const currentIndex = TOAST_POSITIONS.indexOf(position);
        const nextIndex = (currentIndex + 1) % TOAST_POSITIONS.length;
        setPosition(TOAST_POSITIONS[nextIndex]);
        toast.setPosition(position)
        toast.success(`Position changée vers ${position}`)
    }

    const handleMultiple = () => {
        toast.success("Premier toast")
        setTimeout(() => toast.warning("Deuxième toast"), 500)
        setTimeout(() => toast.info("Troisième toast"), 1000)
    }

    return (
        <div>
            {/* En-tête */}
            <div className="border-b p-6">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Design System
                            </h1>
                            <p className="text-sm mt-1 text-muted">
                                Composants, tokens et patrons pour construire des interfaces cohérentes
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={'p-6'}>
                {/* Palette de couleurs */}
                <section>
                    <h2 className="m-v-4">
                        Palette de couleurs
                    </h2>
                    <div className={'grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'}>
                        {colourPalette.map((colour) => (
                            <Card
                                body={
                                    <div className={'flex flex-direction-column gap-2'}>
                                        <p className={'text-lg font-bold'}>{colour.name}</p>
                                        <p className={'text-sm text-muted'}>{colour.description}</p>
                                        <Input id={`input-${colour.value}`} value={colour.value} disabled
                                               aria-labelledby={`input-${colour.value}`}/>
                                    </div>
                                }
                                header={
                                    <div className={'flex justify-between items-center'}>
                                        <div className={`btn-icon ${colour.className} border rounded-md`}/>
                                        <CopyButton textToCopy={colour.value}/>
                                    </div>
                                }/>
                        ))}
                    </div>
                </section>

                {/* Section Typographie */}
                <section>
                    <h2 className="m-v-4">
                        Typographie
                    </h2>
                    <div className={'flex flex-direction-row gap-4'}>
                        <Card
                            body={
                                <div>
                                    <h1>Titre de niveau 1</h1>
                                    <h2>Titre de niveau 2</h2>
                                    <h3>Titre de niveau 3</h3>
                                    <h4>Titre de niveau 4</h4>
                                    <h5>Titre de niveau 5</h5>
                                    <h6>Titre de niveau 6</h6>
                                </div>
                            }
                            header={<h3>Titres</h3>}/>
                        <Card
                            body={
                                <div>
                                    <p className={'text-base'}>Texte par défaut</p>
                                    <p className={'text-base text-muted'}>Texte atténué</p>
                                    <p className={'text-base font-bold'}>Texte important</p>
                                    <p className={'text-xs'}>Texte en petit</p>
                                    <p className={'text-xl font-semibold'}>Texte plus grand</p>
                                </div>
                            }
                            header={<h3>Textes et paragraphes</h3>}/>
                    </div>

                </section>

                {/* Section Composants */}
                <section className={'flex flex-direction-column'}>
                    <h2 className="m-v-4">
                        Composants
                    </h2>
                    <div className={'flex flex-direction-column gap-4'}>

                        {/* Boutons */}
                        <Card
                            body={
                                <>
                                    <div>
                                        <p>Variantes</p>
                                        <div className={'flex flex-wrap gap-4 mb-4'}>
                                            <Button>
                                                Par défaut
                                            </Button>
                                            <Button variant={"btn-secondary"}>
                                                Secondaire
                                            </Button>
                                            <Button variant={"btn-outline"}>
                                                Contour
                                            </Button>
                                            <Button variant={"btn-ghost"}>
                                                Fantôme
                                            </Button>
                                            <Button variant={"btn-destructive"}>
                                                Destructif
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <p>Tailles</p>
                                        <div className={'flex flex-wrap gap-4 mb-4'}>
                                            <Button variant={"btn-primary"} size={"sm"}>
                                                Petit
                                            </Button>
                                            <Button variant={"btn-primary"} size={"default"}>
                                                Par défaut
                                            </Button>
                                            <Button variant={"btn-primary"} size={"lg"}>
                                                Grand
                                            </Button>
                                            <ButtonIcon icon={'settings'} iconSize={16}/>
                                        </div>
                                    </div>
                                    <div>
                                        <p>Avec icône</p>
                                        <div className={'flex flex-wrap gap-4 mb-4'}>
                                            <Button icon={'download'}>Télécharger</Button>
                                            <Button variant={'btn-outline'} icon={'settings'}>Téléverser</Button>
                                            <Button variant={'btn-ghost'} icon={'plus'}>Ajouter un élément</Button>
                                        </div>
                                    </div>
                                    <div>
                                        <p>États</p>
                                        <div className={'flex flex-wrap gap-4 mb-4'}>
                                            <Button>Normal</Button>
                                            <Button disabled>Désactivé</Button>
                                        </div>
                                    </div>
                                </>
                            }
                            header={
                                <h3 className="card-title">
                                    Boutons
                                </h3>
                            }
                            description={
                                <p>
                                    Une collection de styles et variantes de boutons.
                                </p>
                            }
                        />
                        {/* Contrôles de formulaire */}
                        <Card
                            header={
                                <h3>Contrôles de formulaire</h3>
                            }
                            body={
                                <div className={'flex flex-direction-column gap-4'}>
                                    <Input
                                        id={'input-name'}
                                        value={name}
                                        onChange={(val) => {
                                            setName(val);
                                        }}
                                        placeholder={'Entrez votre nom'}
                                        label={'Champ avec label'}
                                    />
                                    <Input id={'input-email'} placeholder={'Entrez votre email'} type={'email'}/>
                                    <Input id={'input-password'} placeholder={'Entrez votre mot de passe'}
                                           type={'password'}/>
                                    <Input id={'input-disabled'} placeholder={'Désactivé'} disabled/>
                                </div>
                            }
                        />

                        {/* Badges */}
                        <Card header={
                            <h3>Badges</h3>
                        }
                              body={
                                  <div className={'flex flex-wrap gap-4 mb-4'}>
                                      <Badge>Défaut </Badge>
                                      <Badge variant={'badge-secondary'}>Secondaire </Badge>
                                      <Badge variant={'badge-success'}>Succès </Badge>
                                      <Badge variant={'badge-warning'}>Avertissement </Badge>
                                      <Badge variant={'badge-error'}>Erreur </Badge>
                                      <Badge variant={'badge-info'}>Info </Badge>
                                      <Badge variant={'badge-outline'}>Contour </Badge>
                                  </div>
                              }
                        />
                        {/* Cards */}
                        <Card header={
                            <h3>Cards</h3>
                        }
                              body={
                                  <div className={'flex flex-wrap gap-4 mb-4'}>
                                      <Card header={<h4>Carte 1</h4>} body={<p>Voici le contenu de la carte 1.</p>}/>
                                      <Card header={<h4>Carte 2</h4>} body={<p>Voici le contenu de la carte 2.</p>}/>
                                      <Card header={<h4>Carte 3</h4>} body={<p>Voici le contenu de la carte 3.</p>}/>
                                  </div>
                              }/>

                        {/* Toast */}
                        <Card header={
                            <h3>Toast</h3>
                        }
                              body={
                                  <div style={{ padding: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                      <Button variant={'btn-primary'} onClick={handleSuccess}>
                                          Toast Succès
                                      </Button>

                                      <Button variant="btn-destructive" onClick={handleError}>
                                          Toast Erreur
                                      </Button>

                                      <Button variant="btn-outline" onClick={handleWarning}>
                                          Toast Warning
                                      </Button>

                                      <Button variant="btn-secondary" onClick={handleInfo}>
                                          Toast Info
                                      </Button>

                                      <Button variant="btn-ghost" onClick={handlePositionChange}>
                                          Changer Position
                                      </Button>

                                      <Button variant="btn-outline" onClick={handleMultiple}>
                                          Plusieurs Toasts
                                      </Button>

                                      <Button variant="btn-outline" onClick={() => toast.clear()}>
                                          Effacer Tous
                                      </Button>
                                  </div>
                              }
                        />
                    </div>

                </section>
            </div>
        </div>
    )

};

export default DesignSystemShowcase;