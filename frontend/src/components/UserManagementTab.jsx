import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

// ─── Small reusable pieces ───────────────────────────────────────

const Badge = ({ children, color = "var(--color-accent)" }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "2px 10px",
      borderRadius: "20px",
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.06em",
      backgroundColor: `${color}18`,
      border: `1px solid ${color}35`,
      color,
      fontFamily: "var(--font-body)",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const Spinner = ({ size = 16 }) => (
  <div
    style={{
      width: size,
      height: size,
      border: "2px solid var(--color-border)",
      borderTopColor: "var(--color-accent)",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      flexShrink: 0,
    }}
  />
);

const Field = ({ label, error, children }) => (
  <div style={{ marginBottom: "16px" }}>
    <label
      style={{
        display: "block",
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-text-secondary)",
        marginBottom: "7px",
      }}
    >
      {label}
    </label>
    {children}
    {error && (
      <p
        style={{
          color: "var(--color-error)",
          fontSize: "0.74rem",
          marginTop: "5px",
        }}
      >
        {error}
      </p>
    )}
  </div>
);

const inputStyle = (hasError) => ({
  width: "100%",
  padding: "10px 13px",
  backgroundColor: "var(--color-surface-2)",
  border: `1px solid ${hasError ? "var(--color-error)" : "var(--color-border)"}`,
  borderRadius: "8px",
  color: "var(--color-text-primary)",
  fontSize: "0.875rem",
  fontFamily: "var(--font-body)",
  outline: "none",
  transition: "border-color 0.2s ease",
});

// ─── Confirm Delete Dialog ─────────────────────────────────────

const ConfirmDialog = ({ user, onConfirm, onCancel, loading }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 60,
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
        maxWidth: "400px",
        margin: "0 16px",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-error)",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(224,82,82,0.15)",
        animation: "scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
      }}
    >
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg, var(--color-error), transparent)",
        }}
      />
      <div style={{ padding: "28px 28px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
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
                marginBottom: "2px",
              }}
            >
              Delete User
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              This action cannot be undone.
            </p>
          </div>
        </div>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            marginBottom: "24px",
            lineHeight: 1.6,
          }}
        >
          Are you sure you want to delete{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>
            @{user?.username}
          </strong>
          ? All their data will be permanently removed.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
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
              borderRadius: "8px",
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
              gap: "8px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <Spinner size={14} /> : null}
            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── User Form Modal (Create / Edit) ─────────────────────────────

const EMPTY_FORM = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  department: "",
  is_admin: false,
  is_active: true,
};

const UserFormModal = ({ mode, user, onSave, onClose }) => {
  const [form, setForm] = useState(
    mode === "edit"
      ? {
          ...EMPTY_FORM,
          ...user,
          password: "",
          is_admin: user?.is_admin || false,
        }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.username?.trim() && mode === "create") e.username = "Required.";
    if (!form.first_name?.trim()) e.first_name = "Required.";
    if (!form.last_name?.trim()) e.last_name = "Required.";
    if (mode === "create" && !form.password) e.password = "Required.";
    if (mode === "create" && form.password && form.password.length < 6)
      e.password = "Min. 6 characters.";
    return e;
  };

  const handleSubmit = async () => {
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password; // don't send empty password on edit

      if (mode === "create") {
        const res = await api.post("/auth/users/", payload);
        onSave(res.data.user, "created");
      } else {
        const res = await api.patch(`/auth/users/${user.id}/`, payload);
        onSave(res.data.user, "updated");
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const serverErrors = {};
        Object.keys(err.response.data.errors).forEach((k) => {
          const v = err.response.data.errors[k];
          serverErrors[k] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(serverErrors);
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
        paddingTop: "300px",
        zIndex: 60,
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
          maxWidth: "520px",
          margin: "0 16px",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          animation: "scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal header */}
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
              {mode === "create" ? "Add New User" : `Edit — @${user?.username}`}
            </h2>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                marginTop: "2px",
              }}
            >
              {mode === "create"
                ? "Fill in the details to create a new account."
                : "Update user information below."}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
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

        {/* Modal body */}
        <div style={{ padding: "24px 26px", overflowY: "auto", flex: 1 }}>
          {errors.general && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
                backgroundColor: "var(--color-error-dim)",
                border: "1px solid rgba(224,82,82,0.25)",
                color: "var(--color-error)",
                fontSize: "0.82rem",
              }}
            >
              {errors.general}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 14px",
            }}
          >
            <Field label="First Name" error={errors.first_name}>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="John"
                style={inputStyle(errors.first_name)}
                onFocus={(e) =>
                  !errors.first_name &&
                  (e.target.style.borderColor = "var(--color-accent)")
                }
                onBlur={(e) =>
                  !errors.first_name &&
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
            </Field>
            <Field label="Last Name" error={errors.last_name}>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Doe"
                style={inputStyle(errors.last_name)}
                onFocus={(e) =>
                  !errors.last_name &&
                  (e.target.style.borderColor = "var(--color-accent)")
                }
                onBlur={(e) =>
                  !errors.last_name &&
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
            </Field>
          </div>

          {mode === "create" && (
            <Field label="Username" error={errors.username}>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="johndoe"
                style={inputStyle(errors.username)}
                onFocus={(e) =>
                  !errors.username &&
                  (e.target.style.borderColor = "var(--color-accent)")
                }
                onBlur={(e) =>
                  !errors.username &&
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
            </Field>
          )}

          <Field label="Email Address" error={errors.email}>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              style={inputStyle(errors.email)}
              onFocus={(e) =>
                !errors.email &&
                (e.target.style.borderColor = "var(--color-accent)")
              }
              onBlur={(e) =>
                !errors.email &&
                (e.target.style.borderColor = "var(--color-border)")
              }
            />
          </Field>

          <Field label="Department" error={errors.department}>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. Engineering"
              style={inputStyle(false)}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-accent)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border)")
              }
            />
          </Field>

          <Field
            label={
              mode === "create"
                ? "Password"
                : "New Password (leave blank to keep)"
            }
            error={errors.password}
          >
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder={
                  mode === "create"
                    ? "Min. 6 characters"
                    : "Leave blank to keep current"
                }
                style={{ ...inputStyle(errors.password), paddingRight: "42px" }}
                onFocus={(e) =>
                  !errors.password &&
                  (e.target.style.borderColor = "var(--color-accent)")
                }
                onBlur={(e) =>
                  !errors.password &&
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  display: "flex",
                }}
              >
                {showPass ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </Field>

          {/* Toggles */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "4px",
            }}
          >
            {[
              {
                name: "is_admin",
                label: "Administrator",
                desc: "Grants full access to user management.",
                color: "var(--color-accent)",
              },
              {
                name: "is_active",
                label: "Active Account",
                desc: "Inactive users cannot log in.",
                color: "var(--color-success)",
              },
            ].map(({ name, label, desc, color }) => (
              <label
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: "var(--color-surface-2)",
                  border: `1px solid ${form[name] ? `${color}35` : "var(--color-border)"}`,
                  transition: "border-color 0.2s",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      marginBottom: "2px",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {desc}
                  </p>
                </div>
                <div
                  style={{
                    width: "42px",
                    height: "24px",
                    borderRadius: "12px",
                    backgroundColor: form[name] ? color : "var(--color-border)",
                    position: "relative",
                    transition: "background-color 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "4px",
                      left: form[name] ? "21px" : "3px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: form[name]
                        ? "#0a0c10"
                        : "var(--color-text-muted)",
                      transition: "left 0.2s",
                    }}
                  />
                  <input
                    type="checkbox"
                    name={name}
                    checked={form[name]}
                    onChange={handleChange}
                    style={{
                      position: "absolute",
                      opacity: 0,
                      width: 0,
                      height: 0,
                    }}
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Modal footer */}
        <div
          style={{
            padding: "18px 26px",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
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
              borderRadius: "8px",
              border: "none",
              background: loading
                ? "var(--color-border)"
                : "linear-gradient(135deg, var(--color-accent), #a8872e)",
              color: loading ? "var(--color-text-muted)" : "#0a0c10",
              fontSize: "0.875rem",
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? <Spinner size={14} /> : null}
            {loading
              ? "Saving..."
              : mode === "create"
                ? "Create User"
                : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Access Wall (non-admin) ──────────────────────────────────────

const AccessWall = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "480px",
      textAlign: "center",
      padding: "40px",
    }}
  >
    <div
      style={{
        position: "relative",
        width: "80px",
        height: "80px",
        marginBottom: "28px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          backgroundColor: "rgba(224,82,82,0.08)",
          animation: "pulse-ring 2s ease-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "8px",
          borderRadius: "50%",
          backgroundColor: "rgba(224,82,82,0.06)",
          animation: "pulse-ring 2s ease-out infinite",
          animationDelay: "0.4s",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "16px",
          borderRadius: "50%",
          backgroundColor: "rgba(224,82,82,0.12)",
          border: "1px solid rgba(224,82,82,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-error)"
          strokeWidth="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          <line x1="12" y1="15" x2="12" y2="17" />
        </svg>
      </div>
    </div>

    <h2
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "1.6rem",
        fontWeight: 700,
        color: "var(--color-text-primary)",
        marginBottom: "10px",
      }}
    >
      Administrator Access Only
    </h2>
    <p
      style={{
        color: "var(--color-text-secondary)",
        fontSize: "0.9rem",
        maxWidth: "380px",
        lineHeight: 1.7,
        marginBottom: "6px",
      }}
    >
      You do not have permission to view the User Management panel.
    </p>
    <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
      Contact your system administrator to request elevated privileges.
    </p>
  </div>
);

// ─── Main User Management Tab ─────────────────────────────────────

const UserManagementTab = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const [modal, setModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', user }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const isAdmin = currentUser?.is_admin;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/users/");
      setUsers(res.data.users || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setForbidden(true);
        setUsers([]);
      } else {
        showToast("Failed to load users.", "error");
      }
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSave = (savedUser, action) => {
    if (action === "created") {
      setUsers((p) => [savedUser, ...p]);
      showToast(`User "@${savedUser.username}" created successfully.`);
    } else {
      setUsers((p) => p.map((u) => (u.id === savedUser.id ? savedUser : u)));
      showToast(`User "@${savedUser.username}" updated successfully.`);
    }
    setModal(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/auth/users/${deleteTarget.id}/`);
      setUsers((p) => p.filter((u) => u.id !== deleteTarget.id));
      showToast(`User "@${deleteTarget.username}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = users.filter((u) =>
    [u.username, u.email, u.full_name, u.department]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(search.toLowerCase())),
  );

  if (forbidden) return <AccessWall />;

  return (
    <div style={{ animation: "fadeInUp 0.4s ease forwards" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 100,
            padding: "12px 20px",
            borderRadius: "10px",
            backgroundColor:
              toast.type === "error"
                ? "rgba(224,82,82,0.15)"
                : "rgba(76,175,130,0.15)",
            border: `1px solid ${toast.type === "error" ? "rgba(224,82,82,0.3)" : "rgba(76,175,130,0.3)"}`,
            color:
              toast.type === "error"
                ? "var(--color-error)"
                : "var(--color-success)",
            fontSize: "0.85rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            animation: "scaleIn 0.2s ease forwards",
            maxWidth: "360px",
          }}
        >
          {toast.type === "error" ? (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ) : (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "4px",
            }}
          >
            User Management
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem" }}>
            {loading
              ? "Loading..."
              : `${users.length} user${users.length !== 1 ? "s" : ""} registered`}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
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
                left: "12px",
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
              placeholder="Search users..."
              style={{
                padding: "9px 14px 9px 36px",
                backgroundColor: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                color: "var(--color-text-primary)",
                fontSize: "0.85rem",
                fontFamily: "var(--font-body)",
                outline: "none",
                width: "220px",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-accent)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border)")
              }
            />
          </div>

          {/* Add user button */}
          <button
            onClick={() => setModal({ mode: "create" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              borderRadius: "8px",
              border: "none",
              background:
                "linear-gradient(135deg, var(--color-accent), #a8872e)",
              color: "#0a0c10",
              fontSize: "0.85rem",
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              transition: "opacity 0.2s",
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
            Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr 100px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          {["User", "Email", "Department", "Role", "Status", "Actions"].map(
            (h) => (
              <span
                key={h}
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                }}
              >
                {h}
              </span>
            ),
          )}
        </div>

        {/* Rows */}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px",
              gap: "12px",
            }}
          >
            <Spinner size={20} />
            <span
              style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}
            >
              Loading users...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              {search ? `No users match "${search}"` : "No users found."}
            </p>
          </div>
        ) : (
          filtered.map((u, idx) => {
            const initials =
              u.first_name && u.last_name
                ? `${u.first_name[0]}${u.last_name[0]}`.toUpperCase()
                : u.username[0].toUpperCase();
            const isSelf = u.id === currentUser?.id;

            return (
              <div
                key={u.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr 100px",
                  padding: "14px 20px",
                  borderBottom:
                    idx < filtered.length - 1
                      ? "1px solid var(--color-border)"
                      : "none",
                  alignItems: "center",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {/* User column */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: u.is_admin
                        ? "linear-gradient(135deg, var(--color-accent), #a8872e)"
                        : "linear-gradient(135deg, #3a4a6b, #2a3a5b)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: u.is_admin
                        ? "#0a0c10"
                        : "var(--color-text-secondary)",
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: "var(--color-text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {u.full_name}
                      {isSelf && (
                        <span
                          style={{
                            color: "var(--color-accent)",
                            fontSize: "0.7rem",
                            marginLeft: "6px",
                          }}
                        >
                          (you)
                        </span>
                      )}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                        fontFamily: "monospace",
                      }}
                    >
                      @{u.username}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingRight: "12px",
                  }}
                >
                  {u.email || "—"}
                </p>

                {/* Department */}
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {u.department || (
                    <span
                      style={{
                        color: "var(--color-text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      Unassigned
                    </span>
                  )}
                </p>

                {/* Role */}
                <div>
                  {u.is_admin ? (
                    <Badge color="var(--color-accent)">Admin</Badge>
                  ) : (
                    <Badge color="var(--color-text-muted)">User</Badge>
                  )}
                </div>

                {/* Status */}
                <div>
                  {u.is_active ? (
                    <Badge color="var(--color-success)">Active</Badge>
                  ) : (
                    <Badge color="var(--color-error)">Inactive</Badge>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => setModal({ mode: "edit", user: u })}
                    title="Edit user"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "7px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-text-muted)",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-accent)";
                      e.currentTarget.style.color = "var(--color-accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.color = "var(--color-text-muted)";
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
                  </button>
                  <button
                    onClick={() => setDeleteTarget(u)}
                    disabled={isSelf}
                    title={isSelf ? "Can't delete yourself" : "Delete user"}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "7px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "transparent",
                      cursor: isSelf ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-text-muted)",
                      transition: "all 0.15s",
                      opacity: isSelf ? 0.35 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelf) {
                        e.currentTarget.style.borderColor =
                          "var(--color-error)";
                        e.currentTarget.style.color = "var(--color-error)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.color = "var(--color-text-muted)";
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
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {modal && (
        <UserFormModal
          mode={modal.mode}
          user={modal.user}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default UserManagementTab;
