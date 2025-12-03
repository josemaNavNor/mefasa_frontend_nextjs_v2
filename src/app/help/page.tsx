export const revalidate = 3600; // Re-generar cada hora

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold">Centro de ayuda HDM</h1>
        <p className="text-muted-foreground">
          Esta página se genera de forma estática con ISR. Es ideal para contenido
          que cambia poco, como documentación interna o FAQs.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">¿Qué es HDM - Help Desk Mefasa?</h2>
          <p className="text-sm text-muted-foreground">
            Es la herramienta interna para gestionar tickets de soporte, incidencias y
            solicitudes de los usuarios dentro de la organización.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">¿Cuándo se usa cada tipo de renderizado?</h2>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li><strong>CSR</strong>: Formularios, tablas interactivas, dashboards vivos.</li>
            <li><strong>SSR</strong>: Rutas protegidas y datos que deben estar listos en el primer render.</li>
            <li><strong>SSG</strong>: Páginas estáticas que casi no cambian.</li>
            <li><strong>ISR</strong>: Contenido semi-estático que se regenera cada cierto tiempo.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}


