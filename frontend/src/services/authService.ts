import api, { saveTokens, clearTokens } from "./api";

// ── Types ──────────────────────────────────────────────────────────
export interface User {
  id:          number;
  email:       string;
  first_name:  string;
  last_name:   string;
  full_name:   string;
  role:        "member" | "volunteer" | "admin";
  phone:       string;
  city:        string;
  country:     string;
  bio:         string;
  education:   string;
  experience:  string;
  skills:      string[];
  avatar:      string | null;
  is_active:   boolean;
  date_joined: string;
}

export interface AuthTokens {
  access:  string;
  refresh: string;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  email:      string;
  first_name: string;
  last_name:  string;
  role:       "member" | "volunteer";
  password:   string;
  password2:  string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?:  string;
  phone?:      string;
  city?:       string;
  country?:    string;
  bio?:        string;
  education?:  string;
  experience?: string;
  skills?:     string[];
}

// ── Cookie helpers (so middleware can read role + token) ───────────
function setCookies(token: string, role: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `access_token=${token}; path=/; expires=${expires}; SameSite=Lax`;
  document.cookie = `user_role=${role}; path=/; expires=${expires}; SameSite=Lax`;
}

function removeCookies() {
  document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

// ── Service functions ──────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<{ user: User; tokens: AuthTokens }> {
  const { data } = await api.post("/api/auth/login/", payload);
  saveTokens(data.tokens.access, data.tokens.refresh);
  setCookies(data.tokens.access, data.user.role);
  return { user: data.user, tokens: data.tokens };
}

export async function register(payload: RegisterPayload): Promise<{
  user:    User;
  tokens?: AuthTokens;
  message: string;
  pending: boolean;
}> {
  const { data } = await api.post("/api/auth/register/", payload);
  const pending = !data.tokens;
  if (data.tokens) {
    saveTokens(data.tokens.access, data.tokens.refresh);
    setCookies(data.tokens.access, data.user.role);
  }
  return { user: data.user, tokens: data.tokens, message: data.message, pending };
}

export async function logout(): Promise<void> {
  const refresh = localStorage.getItem("refresh_token") || "";
  try {
    await api.post("/api/auth/logout/", { refresh });
  } finally {
    clearTokens();
    removeCookies();
  }
}

export async function getMe(): Promise<User> {
  const { data } = await api.get("/api/auth/me/");
  return data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await api.patch("/api/auth/me/update/", payload);
  return data.user;
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await api.post("/api/auth/change-password/", {
    old_password: oldPassword,
    new_password: newPassword,
  });
}