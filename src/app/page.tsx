export default function Home() {
  return (
    <main style={{ padding: "3rem", fontFamily: "system-ui, sans-serif", maxWidth: 640 }}>
      <h1>QA Playground Shop API</h1>
      <p>Backend for the QA Playground Shop frontend — login through checkout, payment, and order history.</p>
      <ul>
        <li>
          <a href="/docs">Swagger UI</a>
        </li>
        <li>
          <a href="/api/docs">OpenAPI JSON</a>
        </li>
        <li>
          <a href="/api/products">GET /api/products</a>
        </li>
      </ul>
    </main>
  );
}
