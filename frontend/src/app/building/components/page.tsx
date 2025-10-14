"use client";

import {
    PageHeader,
    Button,
    Card,
    Checkbox,
    Input,
    LoadingSpinner,
    Radio,
    RadioGroup,
    Toggle,
    Tooltip,
    Modal,
} from "@/components/ui";
import { Select } from "@/components/ui/Select";
import { MultiSelect } from "@/components/ui/Select/MultiSelect";
import ModalQuestion from "@/components/ui/ModalQuestion/ModalQuestion";

import {
    CreateRoleForm,
    CreateQuestionForm,
    CreateUserForm,
    CreateClientForm,
    CreateProjectForm,
    ReponseSelect,
    ReponsesPlusieurs,
    ReponseUnique
} from "@/components/forms"

import { useModal } from "@/hooks"
import React, { useState } from "react";
import { FontAwesomeIcon, Icons } from "@/lib/icons";

export default function BuildingPage() {
    const clientModal = useModal();
    const userModal = useModal();
    const projectModal = useModal();
    const questionModal = useModal();
    const roleModal = useModal();
    const modalUnique = useModal();
    const modalPlusieurs = useModal();
    const modalSelect = useModal();

    const [enable, setEnabled] = React.useState(false);

    const qst = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ?"

    const options = [
        { value: "a", label: "Mathias Coquelin"},
        { value: "b", label: "Porthos About"},
        "Marc Schaeffer",
        "Pierre-Antoine Hébras",
        "Davy Allaire",
        "Alban Robillard",
        "Silvain Fétique",
        "Amaury Mallet",
        "Arnaud Girard",
        "Valentin Roatta",
    ]
    const [selectedOption, setSelectedOption] = useState<string[]>([]);

    return (
        <div className="h-full">
            <PageHeader title="Display des components" description="app/building/components/page.tsx"/>
            <section className="flex flex-col gap-5 items-center">

                <div className="flex flex-col md:flex-row gap-10">
                    <div className="p-3 border w-fit flex flex-col gap-4">
                        <h2 className="font-oswald text-center text-2xl">Button :</h2>
                        <div className="flex items-center gap-4">
                            <h3>Variants</h3>
                            <Button>Bouton</Button>
                            <Button variant="primaryBorder">Bouton</Button>
                            <Button variant="secondary">Bouton</Button>
                            <Button variant="secondaryBorder">Bouton</Button>
                        </div>
                        <div className="flex items-center gap-4 self-center">
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
                    <div className="flex items-center gap-4 self-center">
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
                            <Card title="Titre" color="#DCC1AF" progress={0} buttonLabel="Voir"/>
                            <Card title="Titre" description="Description optionnelle." color="#AB7743" progress={50} buttonLabel="Voir"/>
                            <Card title="Titre" description="Description optionnelle" color="#6B3D17" progress={100} buttonLabel="Voir"/>
                        </div>
                    </div>
                </div>

                <div className="flex gap-10">
                    <div className="p-3 border w-fit h-fit flex flex-col gap-4">
                        <h2 className="font-oswald text-2xl text-center">Checkbox :</h2>
                        <Checkbox label="Simple Checkbox"/>
                        <Checkbox label="Controlled checkbox" disabled checked={true} helperText="Ce checkbox est checked=true et disabled"/>
                        <Checkbox label="Avec Erreur" error="Vous devez cocher cette case"/>
                    </div>

                    <div className="p-3 border flex flex-col gap-6">
                        <h2 className="font-oswald text-2xl text-center">Input :</h2>
                        <div className="flex gap-10">
                            <div className="space-y-5">
                                <Input label="Input Simple" placeholder="Entrez votre nom"/>
                                <Input label="Mot de passe" type="password" error="Mot de passe incorrect"/>
                                <Input
                                variant="success"
                                leftIcon={<FontAwesomeIcon icon={Icons.userTie}/>}
                                rightIcon={<FontAwesomeIcon icon={Icons.check}/>}/>
                            </div>

                            <div className="space-y-5">
                                <Input
                                label="Recherche"
                                placeholder="Rechercher..."
                                helperText="Rechercher un élément dans cette liste "
                                leftIcon={<FontAwesomeIcon icon={Icons.search}/>}/>
                                <Input label="Chargement" loading/>
                            </div>    
                        </div>
                        <div className="w-70 space-y-5">
                            <Select
                            label="Select unique"
                            placeholder="Choisissez un type"
                            options={options}
                            />
                            <MultiSelect
                             label="Options"
                             placeholder="Sélectionner une option..."
                             options={options}
                             value={selectedOption}
                             onChange={setSelectedOption}/>
                        </div>


                    </div>
                    
                    <div className="flex flex-col gap-8">
                        <div className="p-3 h-fit border flex flex-col gap-6">
                            <h2 className="font-oswald text-2xl text-center">LoadingSpiner :</h2>
                            <div className="flex flex-col gap-5 items-center">
                                <LoadingSpinner/>
                                <Button disabled>
                                    <LoadingSpinner/>
                                    Connexion...
                                </Button>
                            </div>
                        </div>
                        <div className="p-3 border w-fit h-fit flex gap-4">
                            <h2 className="font-oswald text-2xl">Modal :</h2>
                            <div className="flex flex-col gap-3">
                                <div>
                                    <Tooltip content={qst} position="rightTop">
                                        <Button
                                         onClick={modalUnique.openModal}
                                         size="sm">
                                            Réponse libre
                                        </Button>
                                    </Tooltip>
                                    <ModalQuestion
                                     modal={modalUnique}
                                     questionId="01"
                                     question={qst}>
                                        <ReponseUnique/>
                                    </ModalQuestion>
                                </div>
                                <div>
                                    <Tooltip content={qst} position="rightTop">
                                        <Button
                                         onClick={modalPlusieurs.openModal}
                                         size="sm">
                                            Réponses ouvertes
                                        </Button>
                                    </Tooltip>
                                    <ModalQuestion
                                     modal={modalPlusieurs}
                                     questionId="02"
                                     question={qst}
                                    >
                                        <ReponsesPlusieurs/>
                                    </ModalQuestion>
                                </div>
                                <div>
                                    <Tooltip content={qst} position="rightTop">
                                        <Button
                                         onClick={modalSelect.openModal}
                                         size="sm">
                                            Réponses select
                                        </Button>
                                    </Tooltip>
                                    <ModalQuestion
                                     modal={modalSelect}
                                     questionId="03"
                                     question={qst}
                                    >
                                        <ReponseSelect/>
                                    </ModalQuestion>
                                </div>
                                <div>
                                    <Tooltip content="Ajouter un rôle" position="right">
                                        <Button
                                         onClick={roleModal.openModal}
                                         size="sm">
                                            <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                                <FontAwesomeIcon icon={Icons.plus}/>
                                            </div>
                                            Nouveau rôle
                                        </Button>
                                    </Tooltip>
                                    <Modal modal={roleModal}
                                     title="ajouter un rôle"
                                     description="Selectionnez les autorisations du nouveau rôle">
                                        <CreateRoleForm/>
                                    </Modal>
                                </div>
                                <div>
                                    <Tooltip content="Ajouter une question" position="right">
                                        <Button
                                        onClick={questionModal.openModal}
                                        size="sm">
                                            <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                                <FontAwesomeIcon icon={Icons.plus}/>
                                            </div>
                                            Nouvelle question
                                        </Button>
                                    </Tooltip>
                                    <Modal modal={questionModal}
                                    title="AJOUTER UNE QUESTION"
                                    description="Entrez les informations de la nouvelle question">
                                        <CreateQuestionForm/>
                                    </Modal>
                                </div>
                                <div>
                                    <Tooltip content="Ajouter un client" position="right">
                                        <Button
                                         onClick={clientModal.openModal}
                                         size="sm">
                                            <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                                <FontAwesomeIcon icon={Icons.plus}/>
                                            </div>
                                            Nouveau client
                                        </Button>
                                    </Tooltip>
                                    <Modal modal={clientModal}
                                     title="AJOUTER UN CLIENT"
                                     description="Entrez les informations du nouveau client">
                                        <CreateClientForm/>
                                    </Modal>
                                </div>
                                <div>
                                    <Tooltip content="Ajouter un utilisateur" position="right">
                                        <Button
                                         onClick={userModal.openModal}
                                         size="sm">
                                            <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                                <FontAwesomeIcon icon={Icons.plus}/>
                                            </div>
                                            Nouvel utilisateur
                                        </Button>
                                    </Tooltip>
                                    <Modal modal={userModal}
                                     title="AJOUTER UN UTILISATEUR"
                                     description="Entrez les informations du nouvel utilisateur">
                                        <CreateUserForm/>
                                    </Modal>
                                </div>
                                <div>
                                    <Tooltip content="Ajouter un projet" position="right">
                                        <Button
                                         onClick={projectModal.openModal}
                                         size="sm">
                                            <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                                <FontAwesomeIcon icon={Icons.plus}/>
                                            </div>
                                            Nouveau projet
                                        </Button>
                                    </Tooltip>
                                    <Modal modal={projectModal}
                                     title="AJOUTER UN PROJET"
                                     description="Entrez les informations du nouveau projet">
                                        <CreateProjectForm/>
                                    </Modal>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="flex gap-10">
                    <div className="p-3 border w-fit h-fit flex gap-4">
                        <h2 className="font-oswald text-2xl">Radio :</h2>
                            <RadioGroup
                            name="choix"
                            defaultValue="option1"
                            className="space-y-3"
                            onValueChange={(val) => console.log(val)}>
                                <Radio label="Option 1" value="option1"/>
                                <Radio label="Option 2" value="option2"/>
                                <Radio label="Option 3" value="option3" disabled/>
                            </RadioGroup>                        
                            <RadioGroup
                            name="choix2"
                            className="space-y-3"
                            onValueChange={(val) => console.log(val)}>
                                <Radio label="Option A" value="optionA" error="Sélection obligatoire"/>
                                <Radio label="Option B" value="optionB" helperText="Choisissez selon vos préférences"/>
                            </RadioGroup>                        
                    </div>
                    <div className="p-3 border w-fit h-fit flex gap-3">
                        <h2 className="font-oswald text-2xl">Toggle :</h2>
                        <div className="space-y-3">
                            <Toggle defaultChecked={true} label="Activer la notification" helperText="Recevoir des alertes par email"/>
                        
                            <Toggle
                            checked={enable}
                            onCheckedChange={setEnabled}
                            label="Mode sombre"
                            helperText="Basculer l'apparence de l'interface"
                            />
                        
                            <Toggle disabled label="Option désactivée"></Toggle>                            
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}