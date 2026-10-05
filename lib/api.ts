const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Please log in to continue.");
    }
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json();
}