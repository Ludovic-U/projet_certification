"use client";

import {
    PageHeader,
    Tooltip,
    Button,
    Modal,
    Input
} from "@/components/ui";
import { FontAwesomeIcon, Icons } from "@/lib/icons";
import { useModal } from "@/hooks";
import CreateQuestionForm from "@/components/forms/CreateQuestion";

export default function PilotagePage() {
    const modal = useModal()
    return (
        <div className="h-full">
            <PageHeader title="Liste des questions" description="Consultez la liste des questions et accèdez aux détails"/>
            <section>

                {/* ADD BTN + SEARCHBAR */}
                <div className="flex items-center justify-between">
                    <div>
                        <Tooltip content="Ajouter un client" position="rightBottom">
                            <Button
                            onClick={modal.openModal}
                            size="sm">
                                <div className="bg-primary rounded-full h-6 w-6 flex items-center justify-center">
                                    <FontAwesomeIcon icon={Icons.plus}/>
                                </div>
                                Nouvelle question
                            </Button>
                        </Tooltip>
                        <Modal modal={modal}
                        title="ajouter une question"
                        description="Entrez les informations de la nouvelle question">
                            <CreateQuestionForm/>
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