// Plantilla genérica
export default function UnderConstructionPage({ title }: { title: string }) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background dark:bg-[#0B1620]">
        <h1 className="text-4xl font-bold text-foreground dark:text-[#EAF2F8] mb-4">{title}</h1>
        <img src="/images/under-construction.svg" alt="Página en construcción" className="w-64 h-64" />
        <p className="mt-4 text-lg text-black-eske dark:text-[#C7D6E0] text-center">Estamos trabajando en esta página. <br></br>¡Pronto estará disponible!</p>
      </main>
    );
  }