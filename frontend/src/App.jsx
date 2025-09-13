function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <main className="mx-auto max-w-3xl px-6 py-12 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Event Invitation Builder</h1>
          <p className="text-sm text-gray-500">Create, preview and share digital event invitations.</p>
        </header>

        <section className="rounded-lg border border-gray-200 p-6 bg-gray-50">
          <p className="text-sm text-gray-600">Form components will go here (title, host, date, location, message, theme).</p>
        </section>

        <section className="rounded-lg border border-gray-200 p-6 bg-gray-50">
          <p className="text-sm text-gray-600">Live preview area will render the styled invitation.</p>
        </section>
      </main>
    </div>
  )
}

export default App
