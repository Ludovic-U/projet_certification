"use client";

export default function ReponseUnique({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <textarea
        placeholder="Ecrivez votre réponse..."
        className={`resize-none w-full h-full font-medium text-lg p-3
                         min-h-30 focus:outline-none`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </>
  );
}
