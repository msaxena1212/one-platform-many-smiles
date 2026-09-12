import { createClient } from "@supabase/supabase-js";

const initialTenantPassword = "Mindz@007";

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: { email?: string; fullName?: string };
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authorization = request.headers.authorization;

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization?.startsWith("Bearer ")) {
    return response.status(500).json({ error: "Tenant provisioning is not configured." });
  }

  const email = request.body?.email?.trim().toLowerCase();
  const fullName = request.body?.fullName?.trim();
  if (!email || !fullName) {
    return response.status(400).json({ error: "Tenant email and full name are required." });
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: callerData, error: callerError } = await callerClient.auth.getUser(
    authorization.slice("Bearer ".length),
  );
  if (callerError || !callerData.user) {
    return response.status(401).json({ error: "Authenticated Leasing user required." });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: callerProfile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", callerData.user.id)
    .maybeSingle();

  if (!callerProfile || !["LEASING", "PROP_MGR", "ADMIN", "SUPER_ADMIN"].includes(callerProfile.role)) {
    return response.status(403).json({ error: "Only Leasing or authorized management users can provision tenants." });
  }

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: initialTenantPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "TENANT" },
    app_metadata: { role: "TENANT" },
  });

  if (createError) {
    if (!createError.message.toLowerCase().includes("already been registered")) {
      return response.status(400).json({ error: createError.message });
    }

    const { data: existing } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const existingUser = existing.users.find((user) => user.email?.toLowerCase() === email);
    if (!existingUser) return response.status(400).json({ error: createError.message });

    await adminClient.auth.admin.updateUserById(existingUser.id, {
      password: initialTenantPassword,
      user_metadata: { full_name: fullName, role: "TENANT" },
      app_metadata: { role: "TENANT" },
    });
    await adminClient.from("profiles").upsert({ id: existingUser.id, full_name: fullName, role: "TENANT" });
    return response.status(200).json({ created: false, email, initialPassword: initialTenantPassword });
  }

  if (!created.user) return response.status(500).json({ error: "Tenant account was not returned by Auth." });
  await adminClient.from("profiles").upsert({ id: created.user.id, full_name: fullName, role: "TENANT" });
  return response.status(201).json({ created: true, email, initialPassword: initialTenantPassword });
}