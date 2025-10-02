"use client";

import {
    PageHeader,
    Tooltip,
    Modal,
    Button,
    Input,
} from "@/components/ui";
import CreateUserForm from "@/components/forms/CreateUser"

import { useModal } from "@/hooks";
import { FontAwesomeIcon, Icons } from "@/lib/icons";

export default function UsersPage() {
    const modal = useModal();
    return (
        <div className="h-full">
            <PageHeader title="Liste des contributeurs" description="Consultez la liste des contributeurs et accèdez aux détails"/>
            <section>

                {/* ADD BTN + SEARCHBAR */}
                <div className="flex items-center justify-between">
                    <div>
                        <Tooltip content="Ajouter un projet" position="rightBottom">
                            <Button
                            onClick={modal.openModal}
                            size="sm">
                                <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                    <FontAwesomeIcon icon={Icons.plus}/>
                                </div>
                                Nouvel utilisateur
                            </Button>
                        </Tooltip>
                        <Modal modal={modal}
                        title="ajouter un utilisateur"
                        description="Entrez les informations du nouvel utilisateur">
                            <CreateUserForm/>
                        </Modal>
                    </div>
                    <Input
                     type="search"
                     leftIcon={<FontAwesomeIcon icon={Icons.search}/>}
                     placeholder="Recherchez dans cette liste..."
                     className="w-70"/>
                </div>
            </section>
        </div>
    );
}