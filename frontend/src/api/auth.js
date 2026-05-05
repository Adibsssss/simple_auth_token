import api from "./axios";

// ─── Djoser Endpoints ─────────────────────────────────────────────────────────

/**
 * POST /api/auth/users/
 * Register a new user. USER_CREATE_PASSWORD_RETYPE is False so
 * no re_password needed.
 */
export const registerUser = async (formData) => {
  const payload = {
    username: formData.username,
    email: formData.email,
    first_name: formData.first_name,
    last_name: formData.last_name,
    password: formData.password,
  };
  const response = await api.post("/auth/users/", payload);
  return response.data;
};

/**
 * POST /api/auth/token/login/
 * Returns { auth_token: "..." }
 */
export const loginUser = async (username, password) => {
  const response = await api.post("/auth/token/login/", { username, password });
  return response.data; // { auth_token: "..." }
};

/**
 * POST /api/auth/token/logout/
 * Deletes the token server-side. Requires Authorization header.
 */
export const logoutUser = async () => {
  const response = await api.post("/auth/token/logout/");
  return response.data;
};

/**
 * GET /api/auth/users/me/
 * Returns the current authenticated user's profile.
 */
export const getUserProfile = async () => {
  const response = await api.get("/auth/users/me/");
  return response.data;
};

/**
 * PATCH /api/auth/users/me/
 * Update current user's own profile fields.
 */
export const updateProfile = async (data) => {
  const response = await api.patch("/auth/users/me/", data);
  return response.data;
};

/**
 * POST /api/auth/users/set_password/
 * Djoser's change-password endpoint.
 * Requires: { current_password, new_password, re_new_password }
 */
export const changePassword = async (data) => {
  const response = await api.post("/auth/users/set_password/", data);
  return response.data;
};

// ─── Custom Admin Endpoints (mounted at /api/admin/) ──────────────────────────

/**
 * GET /api/admin/users/
 * List all users — admin only.
 */
export const getUsers = async () => {
  const response = await api.get("/admin/users/");
  return response.data;
};

/**
 * POST /api/admin/users/
 * Admin creates a new user.
 */
export const adminCreateUser = async (data) => {
  const response = await api.post("/admin/users/", data);
  return response.data;
};

/**
 * PATCH /api/admin/users/:id/
 * Admin updates any user.
 */
export const adminUpdateUser = async (id, data) => {
  const response = await api.patch(`/admin/users/${id}/`, data);
  return response.data;
};

/**
 * DELETE /api/admin/users/:id/
 * Admin deletes a user.
 */
export const adminDeleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}/`);
  return response.data;
};
