/** Same human-facing format the frontend mock already generates: ORD-YYYYMMDD-XXXX. */
export function generateDisplayId(): string {
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ORD-${ymd}-${seq}`;
}
