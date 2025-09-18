"use client";

import { PageHeader, Button, Card, Checkbox, Input } from "@/components/ui";
import { Modal } from "@/components/ui"
import { RegisterForm } from "@/components/forms/RegisterForm";
import { FontAwesomeIcon, Icons } from "@/lib/icons";

import { useModal } from "@/hooks"

export default function BuildingPage() {
    const modal = useModal();

    return (
        <div className="h-full">
            <PageHeader title="Display des components" description="app/building/components/page.tsx"/>
            <section className="flex flex-col gap-5 items-center">

                <div className="p-3 border w-fit flex flex-col gap-4">
                    <h2 className="font-oswald text-center text-2xl">Button :</h2>
                    <div className="flex items-center gap-4">
                        <h3>Variants</h3>
                        <Button>Bouton</Button>
                        <Button variant="primaryBorder">Bouton</Button>
                        <Button variant="secondary">Bouton</Button>
                        <Button variant="secondaryBorder">Bouton</Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <h3>Size</h3>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-center">xs</h4>
                            <Button size="xs">Bouton</Button>
                            <Button size="xs" variant="primaryBorder">Bouton</Button>
                            <Button size="xs" variant="secondary">Bouton</Button>                            
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-center">sm</h4>
                            <Button size="sm">Bouton</Button>
                            <Button size="sm" variant="primaryBorder">Bouton</Button>
                            <Button size="sm" variant="secondary">Bouton</Button>                            
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-center">md</h4>
                            <Button size="md">Bouton</Button>
                            <Button size="md" variant="primaryBorder">Bouton</Button>
                            <Button size="md" variant="secondary">Bouton</Button>                            
                        </div>
                    </div>
                   <div className="flex items-center gap-4">
                        <h3>Icon</h3>
                        <Button variant="primary" size="icon"><FontAwesomeIcon icon={Icons.xmark}/></Button>
                        <Button variant="primaryBorder" size="icon"><FontAwesomeIcon icon={Icons.briefcase}/></Button>
                        <Button variant="secondary" size="icon"><FontAwesomeIcon icon={Icons.plus}/></Button>
                        <Button variant="secondaryBorder" size="icon"><FontAwesomeIcon icon={Icons.search}/></Button>
                    </div>
                </div>

                <div className="p-3 border w-fit flex flex-col gap-4">
                    <h2 className="font-oswald text-2xl text-center">Card :</h2>
                    <div className="flex gap-3 items-center">
                        <Card title="Titre" color="#99B095" progress={0} buttonLabel="Voir"/>
                        <Card title="Titre" description="Description optionnelle." color="#83A18F" progress={50} buttonLabel="Voir"/>
                        <Card title="Titre" description="Description optionnelle" color="#6D8E76" progress={100}/>
                    </div>
                </div>

                <div className="p-3 border w-fit flex flex-col gap-4">
                    <h2 className="font-oswald text-2xl text-center">Checkbox :</h2>
                    <Checkbox label="Simple Checkbox"/>
                    <Checkbox label="Controlled checkbox" disabled checked={true} helperText="Ce checkbox est checked=true et disabled"/>
                    <Checkbox label="Avec Erreur" error="Vous devez cocher cette case"/>
                </div>

                <div className="p-3 border w-fit flex flex-col gap-4">
                    <h2 className="font-oswald text-2xl text-center">Input :</h2>
                    <Input label="Simple input"/>
                    <Input label="Input" placeholder="Placeholder"/>
                    <Input label="Input avec icon" placeholder="Placeholder" leftIcon={<FontAwesomeIcon icon={Icons.calendar}/>}/>
                </div>

                <div className="p-3 border w-fit flex gap-4">
                    <h2 className="font-oswald text-2xl">Modal :</h2>
                    <Button onClick={modal.openModal}>Ouvrir</Button>
                    <Modal
                    modal={modal}
                    title="Créer un nouveau projet"
                    description="Description de la section">
                        <RegisterForm/>
                    </Modal>                    
                </div>
            </section>
        </div>
    );
}