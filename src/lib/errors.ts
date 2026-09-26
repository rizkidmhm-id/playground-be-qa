import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: { message: error.message } }, { status: error.status });
  }

  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Invalid request.";
    return NextResponse.json({ error: { message } }, { status: 400 });
  }

  console.error(error);
  return NextResponse.json({ error: { message: "Internal server error." } }, { status: 500 });
}
