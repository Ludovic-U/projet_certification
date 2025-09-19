"use client";

import { PageHeader, Toggle} from "@/components/ui";
import React from "react";
import { useModal } from "@/hooks"
import { FontAwesomeIcon, Icons} from "@/lib/icons";

export default function BuildingPage() {
    const [enable, setEnabled] = React.useState(false);

    return (
        <div className="h-full">
            <PageHeader title="Page de build" description="app/building/page.tsx"/>
            <section className="bg-light flex flex-col gap-5 p-8 items-center">
            
                <div className="space-y-5">
                    <Toggle defaultChecked={true} label="Activer la notification" helperText="Recevoir des alertes par email"/>

                    <Toggle
                    checked={enable}
                    onCheckedChange={setEnabled}
                    label="Mode sombre"
                    helperText="Basculer l'apparence de l'interface"
                    />

                    <Toggle disabled label="Option désactivée"></Toggle>
                </div>
            </section>
        </div>
    );
}