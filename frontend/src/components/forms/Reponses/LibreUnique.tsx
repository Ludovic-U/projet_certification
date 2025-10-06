"use client";

export default function ReponseUnique() {
    return (
        <>
            <textarea
             placeholder="Ecrivez votre réponse..."
             className={`resize-none w-full h-full font-medium text-lg p-3
                         min-h-30 focus:outline-none`}/>
        </>
    )
}