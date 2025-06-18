// Plantilla genérica
export default function UnderConstructionPage({ title }: { title: string }) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background">
        <h1 className="text-4xl font-bold text-foreground mb-4">{title}</h1>
        <img src="/images/under-construction.svg" alt="Página en construcción" className="w-64 h-64" />
        <p className="mt-4 text-lg text-black-eske">Estamos trabajando en esta página. ¡Pronto estará disponible!</p>
      </main>
    );
  }