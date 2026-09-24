export default function OfflinePage() {
  return (
    <main className="shell offline-shell">
      <div className="eyebrow">All-time / offline</div>
      <h1>Connection required.</h1>
      <p className="lead">
        The installed app shell is available, but model artifacts and the
        latest application assets require a network connection.
      </p>
    </main>
  );
}
