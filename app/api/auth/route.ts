export async function POST(request: Request) {
  const { password } = await request.json();
  const correctPassword = process.env.DASHBOARD_PASSWORD;

  if (!correctPassword) {
    return Response.json(
      { error: "DASHBOARD_PASSWORD not configured. Set it in .env.local" },
      { status: 500 }
    );
  }

  if (password === correctPassword) {
    return Response.json({ success: true });
  }

  return Response.json({ error: "Incorrect password" }, { status: 401 });
}
