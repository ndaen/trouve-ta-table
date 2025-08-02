import Button from "@/components/buttons/Button.tsx";
import ButtonIcon from "@/components/buttons/ButtonIcon.tsx";
import Card from "@/components/cards/Card.tsx";
import Badge from "@/components/Badge.tsx";
import {Input} from "@/components/inputs/Input.tsx";
import {CopyButton} from "@/components/buttons/CopyButton.tsx";
import {useTheme} from "@/stores/themeStore.ts";
import {useState} from "react";

const DesignSystemShowcase = () => {
    const {darkMode} = useTheme();
    const colourPalette = [
        {
            name: 'Background',
            value: darkMode ? '#FFFFFF' : '#000000',
            className: 'bg-background',
            description: 'Primary background'
        },
        {
            name: 'Foreground',
            value: darkMode ? '#FAFAFA' : '#09090B',
            className: 'bg-foreground',
            description: 'Primary text'
        },
        {
            name: 'Card',
            value: darkMode ? '#080808' : '#FFFFFF',
            className: 'bg-card',
            description: 'Card background'
        },
        {
            name: 'Border',
            value: darkMode ? '#262626' : '#E4E4E7',
            className: 'bg-border',
            description: 'Component borders',

        },
        {
            name: 'Primary',
            value: darkMode ? '#FAFAFA' : '#E0E0E5',
            className: 'bg-primary',
            description: 'Primary actions',

        },
        {
            name: 'Secondary',
            value: darkMode ? '#171717' : '#F4F4F5',
            className: 'bg-secondary',
            description: 'Secondary actions',

        },
        {
            name: 'Success',
            value: '#0D9488',
            className: 'bg-success',
            description: 'Success states',

        },
        {
            name: 'Warning',
            value: '#FB923C',
            className: 'bg-warning',
            description: 'Warning states',

        },
        {
            name: 'Error',
            value: '#BE123C',
            className: 'bg-error',
            description: 'Error states',

        },
        {
            name: 'Info',
            value: '#334155',
            className: 'bg-info',
            description: 'Informational states',

        },
    ];
    const [name, setName] = useState<string>('');


    return (
        <div>
            {/* Header */}
            <div className="border-b p-6">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Design System
                            </h1>
                            <p className="text-sm mt-1 text-muted">
                                Components, tokens, and patterns for building consistent interfaces
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            <div className={'p-6'}>

                {/* Design Tokens Section */}
                <section>
                    {/* Colour Palette */}
                    <h2 className="text-xl font-black m-v-4 m-h-2">
                        Colour Palette
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

                {/* Components Section */}
                <section className={'flex flex-direction-column gap-4'}>
                    <h2 className="text-xl font-black m-v-4 m-h-2">
                        Components
                    </h2>
                    {/* Buttons */}
                    <Card
                        body={
                            <>
                                <div>
                                    <p>Variants</p>
                                    <div className={'flex flex-wrap gap-4 mb-4'}>
                                        <Button>
                                            Default
                                        </Button>
                                        <Button variant={"btn-secondary"}>
                                            Secondary
                                        </Button>
                                        <Button variant={"btn-outline"}>
                                            Outline
                                        </Button>
                                        <Button variant={"btn-ghost"}>
                                            Ghost
                                        </Button>
                                        <Button variant={"btn-destructive"}>
                                            Destructive
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <p>Sizes</p>
                                    <div className={'flex flex-wrap gap-4 mb-4'}>
                                        <Button variant={"btn-primary"} size={"sm"}>
                                            Small
                                        </Button>
                                        <Button variant={"btn-primary"} size={"default"}>
                                            Default
                                        </Button>
                                        <Button variant={"btn-primary"} size={"lg"}>
                                            Large
                                        </Button>
                                        <ButtonIcon icon={'settings'} iconSize={16}/>
                                    </div>
                                </div>
                                <div>
                                    <p>With Icon</p>
                                    <div className={'flex flex-wrap gap-4 mb-4'}>
                                        <Button icon={'download'}>Download</Button>
                                        <Button variant={'btn-outline'} icon={'settings'}>Upload</Button>
                                        <Button variant={'btn-ghost'} icon={'plus'}>Add item</Button>
                                    </div>
                                </div>
                                <div>
                                    <p>States</p>
                                    <div className={'flex flex-wrap gap-4 mb-4'}>
                                        <Button>Normal</Button>
                                        <Button disabled>Disabled</Button>
                                    </div>
                                </div>
                            </>
                        }
                        header={
                            <h3 className="card-title">
                                Buttons
                            </h3>
                        }
                        description={
                            <p>
                                A collection of button styles and variants.
                            </p>
                        }
                    />
                    {/* Form Controls */}
                    <Card
                        header={
                            <h3>Form Controls</h3>
                        }
                        body={
                            <div className={'flex flex-direction-column gap-4'}>
                                <Input
                                    id={'input-name'}
                                    value={name}
                                    onChange={(val) => {
                                        setName(val);
                                    }}
                                    placeholder={'Enter your name'}
                                    label={'Input with label'}
                                />
                                <Input id={'input-email'} placeholder={'Enter your email'} type={'email'}/>
                                <Input id={'input-password'} placeholder={'Enter your password'} type={'password'}/>
                                <Input id={'input-disabled'} placeholder={'Disabled'} disabled/>
                            </div>
                        }
                    />

                    {/* Badges */}
                    <Card header={
                        <h3>Badges</h3>
                    }
                          body={
                              <div className={'flex flex-wrap gap-4 mb-4'}>
                                  <Badge>Default </Badge>
                                  <Badge variant={'badge-secondary'}>Secondary </Badge>
                                  <Badge variant={'badge-success'}>Success </Badge>
                                  <Badge variant={'badge-warning'}>Warning </Badge>
                                  <Badge variant={'badge-error'}>Error </Badge>
                                  <Badge variant={'badge-info'}>Info </Badge>
                                  <Badge variant={'badge-outline'}>Outline </Badge>
                              </div>
                          }
                    />
                    {/* Cards */}
                    <Card header={
                        <h3>Cards</h3>
                    }
                          body={
                              <div className={'flex flex-wrap gap-4 mb-4'}>
                                  <Card header={<h4>Card 1</h4>} body={<p>This is the body of card 1.</p>}/>
                                  <Card header={<h4>Card 2</h4>} body={<p>This is the body of card 2.</p>}/>
                                  <Card header={<h4>Card 3</h4>} body={<p>This is the body of card 3.</p>}/>
                              </div>
                          }/>

                </section>

                {/* Usage Guidelines */
                }
            </div>
        </div>
    )

};

export default DesignSystemShowcase;