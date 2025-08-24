import {
    Badge,
    Button,
    ButtonIcon,
    Card,
    CopyButton,
    FilterChips,
    Input,
    SearchInput,
    StatCard,
    TableComponent,
    Tabs,
} from "@/components/ui";
import {useTheme} from "@/stores/themeStore.ts";
import {useState} from "react";
import {type ToastPosition, useToast} from "@/stores/useToastStore.ts";
import {type FilterChip} from "@/components/ui/FilterChips";
import {type TableColumn} from "@/components/ui/TableComponent";
import {type Tab} from "@/components/ui/Tabs";

const DesignSystemPage = () => {
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
    const TOAST_POSITIONS: ToastPosition[] = ['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'];

    // États pour les nouveaux composants
    const [searchValue, setSearchValue] = useState<string>('');
    const [activeFilterChip, setActiveFilterChip] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<string>('overview');

    // Données d'exemple pour les nouveaux composants
    const filterChips: FilterChip[] = [
        {id: 'all', label: 'Tous', value: 24},
        {id: 'active', label: 'Actifs', value: 18},
        {id: 'pending', label: 'En attente', value: 6},
        {id: 'archived', label: 'Archivés'}
    ];

    const tableColumns: TableColumn[] = [
        {id: 'name', label: 'Nom', width: '30%'},
        {id: 'email', label: 'Email', width: '40%'},
        {
            id: 'status', label: 'Statut', width: '20%', render: (value) => (
                <Badge variant={value === 'active' ? 'badge-success' : 'badge-warning'}>
                    {value === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
            )
        },
        {
            id: 'actions', label: 'Actions', width: '10%', render: () => (
                <Button size="sm" variant="btn-ghost">Voir</Button>
            )
        }
    ];

    const tableData = [
        {name: 'Jean Dupont', email: 'jean@example.com', status: 'active'},
        {name: 'Marie Martin', email: 'marie@example.com', status: 'inactive'},
        {name: 'Pierre Durand', email: 'pierre@example.com', status: 'active'}
    ];

    const tabs: Tab[] = [
        {id: 'overview', label: 'Vue d\'ensemble'},
        {id: 'users', label: 'Utilisateurs'},
        {id: 'settings', label: 'Paramètres'},
        {id: 'disabled', label: 'Désactivé', disabled: true}
    ];


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
        toast.setPosition(TOAST_POSITIONS[nextIndex])
        toast.success(`Position changée vers ${TOAST_POSITIONS[nextIndex]}`)
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
                                  <div style={{padding: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
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

                        {/* StatCards */}
                        <Card header={
                            <h3>Cartes de Statistiques</h3>
                        }
                              description={
                                  <p>Cartes pour afficher des métriques avec support des trends et icônes.</p>
                              }
                              body={
                                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                                      <StatCard
                                          label="Utilisateurs"
                                          value="1,234"
                                          icon="users"
                                          trend={{value: 12, type: 'positive'}}
                                      />
                                      <StatCard
                                          label="Revenus"
                                          value="€45,230"
                                          icon="euro"
                                          trend={{value: 8, type: 'negative'}}
                                      />
                                      <StatCard
                                          label="Commandes"
                                          value="892"
                                          icon="shopping-cart"
                                          trend={{value: 0, type: 'neutral'}}
                                      />
                                      <StatCard
                                          label="Conversion"
                                          value="3.2%"
                                          icon="trending-up"
                                      />
                                  </div>
                              }
                        />

                        {/* SearchInput */}
                        <Card header={
                            <h3>Champ de Recherche</h3>
                        }
                              description={
                                  <p>Champ de recherche avec icône et bouton de vidage automatique.</p>
                              }
                              body={
                                  <div className="flex flex-direction-column gap-4 max-w-md">
                                      <SearchInput
                                          placeholder="Rechercher des utilisateurs..."
                                          value={searchValue}
                                          onChange={setSearchValue}
                                      />
                                      {searchValue && (
                                          <p className="text-sm text-muted">
                                              Recherche: "{searchValue}"
                                          </p>
                                      )}
                                  </div>
                              }
                        />

                        {/* FilterChips */}
                        <Card header={
                            <h3>Puces de Filtrage</h3>
                        }
                              description={
                                  <p>Puces cliquables pour filtrer du contenu avec compteurs optionnels.</p>
                              }
                              body={
                                  <div className="flex flex-direction-column gap-4">
                                      <FilterChips
                                          chips={filterChips}
                                          activeChip={activeFilterChip}
                                          onChipClick={setActiveFilterChip}
                                      />
                                      <p className="text-sm text-muted">
                                          Filtre actif: {filterChips.find(c => c.id === activeFilterChip)?.label}
                                      </p>
                                  </div>
                              }
                        />

                        {/* Table */}
                        <Card header={
                            <h3>Tableau</h3>
                        }
                              description={
                                  <p>Tableau responsive avec colonnes configurables et rendu personnalisé.</p>
                              }
                              body={
                                  <TableComponent
                                      columns={tableColumns}
                                      data={tableData}
                                      onRowClick={(row) => toast.info(`Clic sur: ${row.name}`)}
                                  />
                              }
                        />

                        {/* Tabs */}
                        <Card header={
                            <h3>Onglets</h3>
                        }
                              description={
                                  <p>Navigation par onglets avec support des états désactivés.</p>
                              }
                              body={
                                  <Tabs
                                      tabs={tabs}
                                      activeTab={activeTab}
                                      onTabChange={setActiveTab}
                                  >
                                      <div className="p-4 bg-muted rounded-md">
                                          {activeTab === 'overview' && (
                                              <div>
                                                  <h4>Vue d'ensemble</h4>
                                                  <p>Contenu de la vue d'ensemble avec statistiques générales.</p>
                                              </div>
                                          )}
                                          {activeTab === 'users' && (
                                              <div>
                                                  <h4>Gestion des utilisateurs</h4>
                                                  <p>Interface de gestion des comptes utilisateurs.</p>
                                              </div>
                                          )}
                                          {activeTab === 'settings' && (
                                              <div>
                                                  <h4>Paramètres</h4>
                                                  <p>Configuration de l'application et préférences.</p>
                                              </div>
                                          )}
                                      </div>
                                  </Tabs>
                              }
                        />
                    </div>

                </section>
            </div>
        </div>
    )

};

export default DesignSystemPage;