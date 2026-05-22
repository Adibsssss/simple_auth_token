import { useState, useEffect, useCallback } from "react";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  sendReminder,
} from "../api/events";

// ── tiny helpers ──────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, "0");

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const fmtTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const isUpcoming = (iso) => new Date(iso) > new Date();

const REMINDER_OPTIONS = [
  { value: 0, label: "At time of event" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 1440, label: "1 day before" },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  location: "",
  start_time: "",
  end_time: "",
  reminder_minutes: 30,
};

// ── colour / status helpers ───────────────────────────────────────────────────

const statusOf = (event) => {
  const now = new Date();
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  if (end < now)
    return {
      label: "Past",
      color: "var(--color-text-muted)",
      bg: "rgba(90,92,102,0.12)",
    };
  if (start < now)
    return { label: "Ongoing", color: "#f0a500", bg: "rgba(240,165,0,0.1)" };
  return {
    label: "Upcoming",
    color: "var(--color-success)",
    bg: "rgba(76,175,130,0.1)",
  };
};

// ── Spinner ───────────────────────────────────────────────────────────────────

const Spinner = ({ size = 16 }) => (
  <div
    style={{
      width: size,
      height: size,
      flexShrink: 0,
      border: "2px solid var(--color-border)",
      borderTopColor: "var(--color-accent)",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }}
  />
);

// ── Toast ─────────────────────────────────────────────────────────────────────

const Toast = ({ toast }) => {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 200,
        padding: "12px 20px",
        borderRadius: 10,
        backgroundColor: isErr
          ? "rgba(224,82,82,0.15)"
          : "rgba(76,175,130,0.15)",
        border: `1px solid ${isErr ? "rgba(224,82,82,0.3)" : "rgba(76,175,130,0.3)"}`,
        color: isErr ? "var(--color-error)" : "var(--color-success)",
        fontSize: "0.85rem",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        maxWidth: 380,
        animation: "fadeInUp 0.3s ease forwards",
      }}
    >
      {isErr ? (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ) : (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {toast.message}
    </div>
  );
};

// ── Confirm Delete dialog ──────────────────────────────────────────────────────

const ConfirmDelete = ({ event, onConfirm, onCancel, loading }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 150,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(6px)",
    }}
    onClick={(e) => e.target === e.currentTarget && onCancel()}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 400,
        margin: "0 16px",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-error)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(224,82,82,0.15)",
        animation: "scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
      }}
    >
      <div
        style={{
          height: 3,
          background: "linear-gradient(90deg,var(--color-error),transparent)",
        }}
      />
      <div style={{ padding: "28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "rgba(224,82,82,0.12)",
              border: "1px solid rgba(224,82,82,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-error)"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </div>
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              Cancel Event
            </h3>
            <p
              style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}
            >
              A cancellation email will be sent.
            </p>
          </div>
        </div>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Delete{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>
            "{event?.title}"
          </strong>
          ? This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              backgroundColor: "transparent",
              color: "var(--color-text-secondary)",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "var(--color-error)",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && <Spinner size={14} />}
            {loading ? "Deleting…" : "Delete Event"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Field wrapper ─────────────────────────────────────────────────────────────

const Field = ({ label, error, required, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label
      style={{
        display: "block",
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-text-secondary)",
        marginBottom: 7,
      }}
    >
      {label}
      {required && (
        <span style={{ color: "var(--color-accent)", marginLeft: 4 }}>*</span>
      )}
    </label>
    {children}
    {error && (
      <p
        style={{
          color: "var(--color-error)",
          fontSize: "0.74rem",
          marginTop: 5,
        }}
      >
        {error}
      </p>
    )}
  </div>
);

const inputSty = (err) => ({
  width: "100%",
  padding: "10px 13px",
  backgroundColor: "var(--color-surface-2)",
  border: `1px solid ${err ? "var(--color-error)" : "var(--color-border)"}`,
  borderRadius: 8,
  color: "var(--color-text-primary)",
  fontSize: "0.875rem",
  fontFamily: "var(--font-body)",
  outline: "none",
  transition: "border-color 0.2s",
  colorScheme: "dark",
});

// ── Event Form Modal ───────────────────────────────────────────────────────────

const EventFormModal = ({ mode, event, onSave, onClose }) => {
  const [form, setForm] = useState(
    mode === "edit" && event
      ? {
          title: event.title,
          description: event.description || "",
          location: event.location || "",
          start_time: toLocalInput(event.start_time),
          end_time: toLocalInput(event.end_time),
          reminder_minutes: event.reminder_minutes,
        }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.start_time) e.start_time = "Start time is required.";
    if (!form.end_time) e.end_time = "End time is required.";
    if (form.start_time && form.end_time && form.end_time <= form.start_time)
      e.end_time = "End time must be after start time.";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      // Convert local datetime-local strings to ISO UTC
      const payload = {
        ...form,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      };
      let result;
      if (mode === "create") result = await createEvent(payload);
      else result = await updateEvent(event.id, payload);
      onSave(result.event, mode);
    } catch (err) {
      if (err.response?.data?.errors) {
        const sv = {};
        Object.keys(err.response.data.errors).forEach((k) => {
          const v = err.response.data.errors[k];
          sv[k] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(sv);
      } else {
        setErrors({
          general: err.response?.data?.message || "Something went wrong.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          margin: "0 16px",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          animation: "scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "22px 26px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {mode === "create"
                ? "Schedule New Event"
                : `Edit — ${event?.title}`}
            </h2>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                marginTop: 2,
              }}
            >
              {mode === "create"
                ? "A confirmation email will be sent after scheduling."
                : "An update email will be sent when saved."}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              backgroundColor: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-muted)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 26px", overflowY: "auto", flex: 1 }}>
          {errors.general && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                marginBottom: 16,
                backgroundColor: "var(--color-error-dim)",
                border: "1px solid rgba(224,82,82,0.25)",
                color: "var(--color-error)",
                fontSize: "0.82rem",
              }}
            >
              {errors.general}
            </div>
          )}

          <Field label="Event Title" error={errors.title} required>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Team Planning Meeting"
              style={inputSty(errors.title)}
              onFocus={(e) => {
                if (!errors.title)
                  e.target.style.borderColor = "var(--color-accent)";
              }}
              onBlur={(e) => {
                if (!errors.title)
                  e.target.style.borderColor = "var(--color-border)";
              }}
            />
          </Field>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <Field label="Start Date & Time" error={errors.start_time} required>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => set("start_time", e.target.value)}
                style={inputSty(errors.start_time)}
                onFocus={(e) => {
                  if (!errors.start_time)
                    e.target.style.borderColor = "var(--color-accent)";
                }}
                onBlur={(e) => {
                  if (!errors.start_time)
                    e.target.style.borderColor = "var(--color-border)";
                }}
              />
            </Field>
            <Field label="End Date & Time" error={errors.end_time} required>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => set("end_time", e.target.value)}
                style={inputSty(errors.end_time)}
                onFocus={(e) => {
                  if (!errors.end_time)
                    e.target.style.borderColor = "var(--color-accent)";
                }}
                onBlur={(e) => {
                  if (!errors.end_time)
                    e.target.style.borderColor = "var(--color-border)";
                }}
              />
            </Field>
          </div>

          <Field label="Location">
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Room 101 / Zoom / etc."
              style={inputSty(false)}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--color-accent)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--color-border)";
              }}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional details about the event…"
              rows={3}
              style={{
                ...inputSty(false),
                resize: "vertical",
                lineHeight: 1.6,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--color-accent)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--color-border)";
              }}
            />
          </Field>

          <Field label="Email Reminder">
            <div style={{ position: "relative" }}>
              <select
                value={form.reminder_minutes}
                onChange={(e) =>
                  set("reminder_minutes", Number(e.target.value))
                }
                style={{
                  ...inputSty(false),
                  appearance: "none",
                  paddingRight: 36,
                  cursor: "pointer",
                  backgroundColor: "var(--color-surface-2)",
                }}
              >
                {REMINDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-muted)"
                strokeWidth="2.5"
                style={{
                  position: "absolute",
                  right: 13,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "18px 26px",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              backgroundColor: "transparent",
              color: "var(--color-text-secondary)",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 2,
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: loading
                ? "var(--color-border)"
                : "linear-gradient(135deg,var(--color-accent),#a8872e)",
              color: loading ? "var(--color-text-muted)" : "#0a0c10",
              fontSize: "0.875rem",
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading && <Spinner size={14} />}
            {loading
              ? "Saving…"
              : mode === "create"
                ? "Schedule Event"
                : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Event Detail drawer ────────────────────────────────────────────────────────

const EventDetail = ({
  event,
  onEdit,
  onDelete,
  onRemind,
  onClose,
  currentUser,
}) => {
  const [reminding, setReminding] = useState(false);
  const st = statusOf(event);
  const isOwner = event.created_by_id === currentUser?.id;
  const isAdmin = currentUser?.is_admin;
  const canManage = isOwner || isAdmin;

  const handleRemind = async () => {
    setReminding(true);
    await onRemind(event);
    setReminding(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          margin: "0 16px",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 14,
          overflow: "hidden",
          animation: "scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            height: 3,
            background:
              "linear-gradient(90deg,var(--color-accent),transparent)",
          }}
        />

        <div style={{ padding: "26px 28px" }}>
          {/* Status + close */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                padding: "3px 12px",
                borderRadius: 20,
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                backgroundColor: st.bg,
                color: st.color,
                border: `1px solid ${st.color}40`,
              }}
            >
              {st.label}
            </span>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                border: "1px solid var(--color-border)",
                backgroundColor: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-muted)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 20,
              lineHeight: 1.3,
            }}
          >
            {event.title}
          </h2>

          {/* Meta rows */}
          {[
            {
              icon: (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              ),
              label: "Date",
              value: fmtDate(event.start_time),
            },
            {
              icon: (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ),
              label: "Time",
              value: `${fmtTime(event.start_time)} – ${fmtTime(event.end_time)}  (${event.duration_minutes} min)`,
            },
            event.location && {
              icon: (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ),
              label: "Location",
              value: event.location,
            },
            {
              icon: (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              ),
              label: "Reminder",
              value: event.reminder_label,
            },
            {
              icon: (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              ),
              label: "Created by",
              value: event.created_by,
            },
          ]
            .filter(Boolean)
            .map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom:
                    i < 3 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <span
                  style={{
                    color: "var(--color-accent)",
                    marginTop: 1,
                    flexShrink: 0,
                  }}
                >
                  {row.icon}
                </span>
                <div>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--color-text-muted)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    {row.label}
                  </p>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {row.value}
                  </p>
                </div>
              </div>
            ))}

          {event.description && (
            <div
              style={{
                marginTop: 16,
                padding: "14px 16px",
                borderRadius: 8,
                backgroundColor: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Notes
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.7,
                }}
              >
                {event.description}
              </p>
            </div>
          )}

          {/* Actions */}
          {canManage && (
            <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
              <button
                onClick={handleRemind}
                disabled={reminding}
                style={{
                  flex: 1,
                  padding: "9px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  backgroundColor: "transparent",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.82rem",
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {reminding ? (
                  <Spinner size={13} />
                ) : (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                )}
                {reminding ? "Sending…" : "Send Reminder"}
              </button>
              <button
                onClick={() => onEdit(event)}
                style={{
                  flex: 1,
                  padding: "9px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  backgroundColor: "transparent",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.82rem",
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => onDelete(event)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(224,82,82,0.3)",
                  backgroundColor: "rgba(224,82,82,0.08)",
                  color: "var(--color-error)",
                  fontSize: "0.82rem",
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Event card ────────────────────────────────────────────────────────────────

const EventCard = ({ event, onClick }) => {
  const st = statusOf(event);
  return (
    <div
      onClick={() => onClick(event)}
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "18px 20px",
        cursor: "pointer",
        transition: "border-color 0.2s, transform 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: st.color,
          borderRadius: "10px 0 0 10px",
        }}
      />
      <div style={{ paddingLeft: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.98rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              lineHeight: 1.4,
            }}
          >
            {event.title}
          </h3>
          <span
            style={{
              padding: "2px 9px",
              borderRadius: 20,
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              backgroundColor: st.bg,
              color: st.color,
              border: `1px solid ${st.color}40`,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {st.label}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 18px",
            marginBottom: event.description ? 10 : 0,
          }}
        >
          {[
            { icon: "📅", text: fmtDate(event.start_time) },
            {
              icon: "⏰",
              text: `${fmtTime(event.start_time)} – ${fmtTime(event.end_time)}`,
            },
            event.location && { icon: "📍", text: event.location },
          ]
            .filter(Boolean)
            .map((row, i) => (
              <span
                key={i}
                style={{
                  fontSize: "0.78rem",
                  color: "var(--color-text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span style={{ fontSize: "0.8em" }}>{row.icon}</span>
                {row.text}
              </span>
            ))}
        </div>

        {event.description && (
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--color-text-muted)",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.5,
            }}
          >
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
};

// ── Main EventsTab ─────────────────────────────────────────────────────────────

const EventsTab = ({ currentUser }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | upcoming | past
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { mode, event? }
  const [detail, setDetail] = useState(null); // event to view
  const [deleteTarget, setDelTarget] = useState(null);
  const [deleteLoading, setDelLoad] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const filterParam =
        filter === "all" ? "" : filter === "upcoming" ? "true" : "false";
      const res = await getEvents(filterParam);
      setEvents(res.events || []);
    } catch {
      showToast("Failed to load events.", "error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSave = (saved, mode) => {
    if (mode === "create") {
      setEvents((p) =>
        [saved, ...p].sort(
          (a, b) => new Date(a.start_time) - new Date(b.start_time),
        ),
      );
      showToast(`"${saved.title}" scheduled! Confirmation email sent.`);
    } else {
      setEvents((p) => p.map((e) => (e.id === saved.id ? saved : e)));
      showToast(`"${saved.title}" updated! Update email sent.`);
    }
    setModal(null);
    setDetail(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDelLoad(true);
    try {
      await deleteEvent(deleteTarget.id);
      setEvents((p) => p.filter((e) => e.id !== deleteTarget.id));
      showToast(`"${deleteTarget.title}" deleted. Cancellation email sent.`);
      setDelTarget(null);
      setDetail(null);
    } catch {
      showToast("Delete failed.", "error");
    } finally {
      setDelLoad(false);
    }
  };

  const handleRemind = async (event) => {
    try {
      const res = await sendReminder(event.id);
      showToast(res.message || "Reminder sent!");
      // Mark in local state
      setEvents((p) =>
        p.map((e) => (e.id === event.id ? { ...e, reminder_sent: true } : e)),
      );
    } catch {
      showToast("Failed to send reminder.", "error");
    }
  };

  const filtered = events.filter((e) => {
    if (!search) return true;
    return [e.title, e.description, e.location, e.created_by]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(search.toLowerCase()));
  });

  const upcoming = filtered.filter((e) => isUpcoming(e.start_time));
  const past = filtered.filter((e) => !isUpcoming(e.start_time));

  const FILTERS = [
    { id: "all", label: "All Events", count: filtered.length },
    { id: "upcoming", label: "Upcoming", count: upcoming.length },
    { id: "past", label: "Past", count: past.length },
  ];

  return (
    <div style={{ animation: "fadeInUp 0.4s ease forwards" }}>
      <Toast toast={toast} />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            Events &amp; Schedule
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem" }}>
            {loading
              ? "Loading…"
              : `${events.length} event${events.length !== 1 ? "s" : ""} total`}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative" }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth="2"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events…"
              style={{
                padding: "9px 14px 9px 36px",
                backgroundColor: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                color: "var(--color-text-primary)",
                fontSize: "0.85rem",
                fontFamily: "var(--font-body)",
                outline: "none",
                width: 200,
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-accent)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border)")
              }
            />
          </div>

          {/* Add button */}
          <button
            onClick={() => setModal({ mode: "create" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg,var(--color-accent),#a8872e)",
              color: "#0a0c10",
              fontSize: "0.85rem",
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Event
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          borderBottom: "1px solid var(--color-border)",
          paddingBottom: 0,
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "8px 16px",
              border: "none",
              backgroundColor: "transparent",
              borderBottom:
                filter === f.id
                  ? "2px solid var(--color-accent)"
                  : "2px solid transparent",
              color:
                filter === f.id
                  ? "var(--color-accent)"
                  : "var(--color-text-secondary)",
              fontSize: "0.85rem",
              fontWeight: filter === f.id ? 600 : 400,
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: -1,
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            {f.label}
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "1px 7px",
                borderRadius: 10,
                backgroundColor:
                  filter === f.id
                    ? "var(--color-accent-dim)"
                    : "rgba(90,92,102,0.15)",
                color:
                  filter === f.id
                    ? "var(--color-accent)"
                    : "var(--color-text-muted)",
              }}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px",
            gap: 12,
          }}
        >
          <Spinner size={24} />
          <span
            style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}
          >
            Loading events…
          </span>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 40px",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth="1"
            style={{ marginBottom: 16, opacity: 0.5 }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.95rem",
              marginBottom: 8,
            }}
          >
            {search ? `No events match "${search}"` : "No events yet"}
          </p>
          {!search && (
            <button
              onClick={() => setModal({ mode: "create" })}
              style={{
                marginTop: 12,
                padding: "9px 20px",
                borderRadius: 8,
                border: "none",
                background:
                  "linear-gradient(135deg,var(--color-accent),#a8872e)",
                color: "#0a0c10",
                fontSize: "0.85rem",
                fontWeight: 700,
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              Schedule your first event
            </button>
          )}
        </div>
      ) : (
        <div>
          {(filter === "all" || filter === "upcoming") &&
            upcoming.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                {filter === "all" && (
                  <h3
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-success)",
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "var(--color-success)",
                        display: "inline-block",
                      }}
                    />
                    Upcoming ({upcoming.length})
                  </h3>
                )}
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                  }}
                >
                  {upcoming.map((e) => (
                    <EventCard key={e.id} event={e} onClick={setDetail} />
                  ))}
                </div>
              </div>
            )}

          {(filter === "all" || filter === "past") && past.length > 0 && (
            <div>
              {filter === "all" && (
                <h3
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "var(--color-text-muted)",
                      display: "inline-block",
                    }}
                  />
                  Past ({past.length})
                </h3>
              )}
              <div
                style={{
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                }}
              >
                {past.map((e) => (
                  <EventCard key={e.id} event={e} onClick={setDetail} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {modal && (
        <EventFormModal
          mode={modal.mode}
          event={modal.event}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {detail && !modal && !deleteTarget && (
        <EventDetail
          event={detail}
          currentUser={currentUser}
          onEdit={(ev) => {
            setDetail(null);
            setModal({ mode: "edit", event: ev });
          }}
          onDelete={(ev) => {
            setDetail(null);
            setDelTarget(ev);
          }}
          onRemind={handleRemind}
          onClose={() => setDetail(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDelete
          event={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDelTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default EventsTab;
