export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  token: string | null,
  sendRefreshToken: () => Promise<string | null>
) {
  let authToken = token;

  // Log token untuk memastikan nilainya
  console.log("Auth Token:", authToken);

  // Mengirim permintaan pertama dengan token yang ada
  let res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
    credentials: "include",
  });

  // Log status response pertama
  console.log("Initial response status:", res.status);

  // Menangani status 401 Unauthorized (token kadaluarsa)
  if (res.status === 401) {
    console.log("Token expired or unauthorized. Attempting to refresh...");
    const newToken = await sendRefreshToken();
    if (!newToken) {
      console.log("Failed to refresh token");
      throw new Error("Unauthorized, refresh failed");
    }
    console.log("New token received:", newToken);

    // Retry request with new token
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
        ...options.headers,
      },
      credentials: "include",
    });

    console.log("Retry response status:", res.status);
  }

  // Jika respons bukan OK (misalnya status 500, 404, dll), lempar error
  if (!res.ok) {
    console.log(`Fetch failed with status ${res.status}`);
  }
  console.log(res);
  // Parsing respons JSON
  const jsonResponse = await res.json();

  // Log JSON response yang diterima
  console.log("Response JSON:", jsonResponse);

  return jsonResponse;
}
