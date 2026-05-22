import api from "./axios";

/** GET /api/events/?upcoming=true|false */
export const getEvents = async (filter = "") => {
  const params = filter ? `?upcoming=${filter}` : "";
  const res = await api.get(`/events/${params}`);
  return res.data;
};

/** GET /api/events/:id/ */
export const getEvent = async (id) => {
  const res = await api.get(`/events/${id}/`);
  return res.data;
};

/** POST /api/events/ */
export const createEvent = async (data) => {
  const res = await api.post("/events/", data);
  return res.data;
};

/** PATCH /api/events/:id/ */
export const updateEvent = async (id, data) => {
  const res = await api.patch(`/events/${id}/`, data);
  return res.data;
};

/** DELETE /api/events/:id/ */
export const deleteEvent = async (id) => {
  const res = await api.delete(`/events/${id}/`);
  return res.data;
};

/** POST /api/events/:id/remind/ */
export const sendReminder = async (id) => {
  const res = await api.post(`/events/${id}/remind/`);
  return res.data;
};
