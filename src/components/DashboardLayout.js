import React from 'react';

const Pane = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <header className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h2>
    </header>
    <div className="h-[calc(100%-2rem)] min-h-40">{children}</div>
  </section>
);

export default function DashboardLayout({
  chatPane,
  mapPane,
  actionPane,
  statsPane
}) {
  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2">
        <Pane title="Pane A · AI Chat">{chatPane}</Pane>
        <Pane title="Pane C · Action Card">{actionPane}</Pane>
        <Pane title="Pane B · Route Map">{mapPane}</Pane>
        <Pane title="Pane D · Live Stats">{statsPane}</Pane>
      </div>
    </main>
  );
}
