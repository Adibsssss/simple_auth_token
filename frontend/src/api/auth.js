import api from "./axios";

/** POST /api/auth/register/ */
export const registerUser = async (formData) => {
  const response = await api.post("/auth/register/", formData);
  return response.data;
};

/** POST /api/auth/login/ */
export const loginUser = async (username, password) => {
  const response = await api.post("/auth/login/", { username, password });
  return response.data;
};

/** POST /api/auth/logout/ */
export const logoutUser = async () => {
  const response = await api.post("/auth/logout/");
  return response.data;
};

/** GET /api/auth/profile/ */
export const getUserProfile = async () => {
  const response = await api.get("/auth/profile/");
  return response.data;
};

/** PATCH /api/auth/profile/ */
export const updateProfile = async (data) => {
  const response = await api.patch("/auth/profile/", data);
  return response.data;
};

/** POST /api/auth/change-password/ */
export const changePassword = async (data) => {
  const response = await api.post("/auth/change-password/", data);
  return response.data;
};

/** GET /api/auth/verify/ */
export const verifyToken = async () => {
  const response = await api.get("/auth/verify/");
  return response.data;
};

/** GET /api/auth/users/ — admin only */
export const getUsers = async () => {
  const response = await api.get("/auth/users/");
  return response.data;
};
