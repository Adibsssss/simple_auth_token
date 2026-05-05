import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";

const InputField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  icon,
  rightElement,
}) => (
  <div style={{ marginBottom: "18px" }}>
    <label
      htmlFor={id}
      style={{
        display: "block",
        fontSize: "0.75rem",
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-text-secondary)",
        marginBottom: "7px",
      }}
    >
      {label}
    </label>
    <div style={{ position: "relative" }}>
      {icon && (
        <div
          style={{
            position: "absolute",
            left: "13px",
            top: "50%",
            transform: "translateY(-50%)",
            color: error ? "var(--color-error)" : "var(--color-text-muted)",
            pointerEvents: "none",
          }}
        >
          {icon}
        </div>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={id}
        style={{
          width: "100%",
          padding: `12px ${rightElement ? "42px" : "14px"} 12px ${icon ? "40px" : "14px"}`,
          backgroundColor: "var(--color-surface-2)",
          border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
          borderRadius: "8px",
          color: "var(--color-text-primary)",
          fontSize: "0.875rem",
          fontFamily: "var(--font-body)",
          outline: "none",
          transition: "border-color 0.2s ease",
        }}
        onFocus={(e) => {
          if (!error) e.target.style.borderColor = "var(--color-accent)";
        }}
        onBlur={(e) => {
          if (!error) e.target.style.borderColor = "var(--color-border)";
        }}
      />
      {rightElement && (
        <div
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {rightElement}
        </div>
      )}
    </div>
    {error && (
      <p
        style={{
          color: "var(--color-error)",
          fontSize: "0.75rem",
          marginTop: "5px",
        }}
      >
        {error}
      </p>
    )}
  </div>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg
      width="15"
      height="15"
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
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    if (!form.first_name.trim()) e.first_name = "First name is required.";
    if (!form.last_name.trim()) e.last_name = "Last name is required.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters.";
    if (!form.password2) e.password2 = "Please confirm your password.";
    else if (form.password !== form.password2)
      e.password2 = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await registerUser(form);

      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      if (err.response?.data) {
        const serverErrors = {};
        const d = err.response.data;
        // Djoser returns field errors as { field: ["msg"] }
        Object.keys(d).forEach((key) => {
          serverErrors[key] = Array.isArray(d[key]) ? d[key][0] : d[key];
        });
        setErrors(serverErrors);
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const userIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
  const mailIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
  const lockIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
        display: "flex",
        fontFamily: "var(--font-body)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-col justify-between"
        style={{
          width: "38%",
          minHeight: "100vh",
          backgroundColor: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          padding: "48px 52px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.035,
          }}
          preserveAspectRatio="none"
        >
          {[...Array(10)].map((_, i) => (
            <line
              key={i}
              x1={`${i * 15 - 50}%`}
              y1="0"
              x2={`${i * 15 + 50}%`}
              y2="100%"
              stroke="var(--color-accent)"
              strokeWidth="1"
            />
          ))}
        </svg>

        <div
          className="animate-fade-in-up"
          style={{ position: "relative", zIndex: 1 }}
        >
          <div className="flex items-center gap-3 mb-12">
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "1px solid var(--color-accent)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="1.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              Nexus Portal
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.4rem",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "var(--color-text-primary)",
              marginBottom: "18px",
            }}
          >
            Create Your
            <br />
            <span className="text-shimmer">Account</span>
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.9rem",
              lineHeight: 1.7,
              maxWidth: "300px",
            }}
          >
            Register to gain access. Authentication is handled securely via{" "}
            <strong style={{ color: "var(--color-accent)" }}>Djoser</strong>.
          </p>
        </div>

        <div
          className="animate-fade-in-up delay-200"
          style={{ position: "relative", zIndex: 1 }}
        >
          {[
            { step: "01", label: "Fill in your details" },
            { step: "02", label: "Secure your account with a password" },
            { step: "03", label: "Access the system instantly" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 mb-5">
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--color-accent)",
                  minWidth: "28px",
                }}
              >
                {item.step}
              </span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "var(--color-border)",
                }}
              />
              <span
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <p
          className="animate-fade-in-up delay-300"
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.75rem",
            position: "relative",
            zIndex: 1,
            paddingTop: "20px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          © {new Date().getFullYear()} Nexus Systems. All rights reserved.
        </p>
      </div>

      {/* Right: Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <div className="animate-fade-in-up" style={{ marginBottom: "28px" }}>
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 500,
                letterSpacing: "0.12em",
                color: "var(--color-accent)",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              New Account
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "6px",
              }}
            >
              Register
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Sign in
              </Link>
            </p>
          </div>

          {errors.general && (
            <div
              className="animate-fade-in"
              style={{
                backgroundColor: "var(--color-error-dim)",
                border: "1px solid rgba(224,82,82,0.25)",
                borderRadius: "8px",
                padding: "12px 14px",
                marginBottom: "18px",
                fontSize: "0.85rem",
                color: "var(--color-error)",
              }}
            >
              {errors.general}
            </div>
          )}

          {success && (
            <div
              className="animate-fade-in"
              style={{
                backgroundColor: "rgba(76,175,130,0.1)",
                border: "1px solid rgba(76,175,130,0.3)",
                borderRadius: "8px",
                padding: "12px 14px",
                marginBottom: "18px",
                fontSize: "0.85rem",
                color: "var(--color-success)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Account created! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div
              className="animate-fade-in-up delay-100"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <InputField
                id="first_name"
                label="First Name"
                value={form.first_name}
                onChange={handleChange}
                error={errors.first_name}
                placeholder="John"
                icon={userIcon}
              />
              <InputField
                id="last_name"
                label="Last Name"
                value={form.last_name}
                onChange={handleChange}
                error={errors.last_name}
                placeholder="Doe"
                icon={userIcon}
              />
            </div>

            <div className="animate-fade-in-up delay-200">
              <InputField
                id="username"
                label="Username"
                value={form.username}
                onChange={handleChange}
                error={errors.username}
                placeholder="johndoe"
                icon={userIcon}
              />
            </div>
            <div className="animate-fade-in-up delay-200">
              <InputField
                id="email"
                label="Email Address"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="john@example.com"
                icon={mailIcon}
              />
            </div>

            <div
              className="animate-fade-in-up delay-300"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <InputField
                id="password"
                label="Password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Min. 6 chars"
                icon={lockIcon}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text-muted)",
                      display: "flex",
                      padding: "2px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color =
                        "var(--color-text-secondary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--color-text-muted)")
                    }
                  >
                    <EyeIcon open={showPass} />
                  </button>
                }
              />
              <InputField
                id="password2"
                label="Confirm"
                type={showPass2 ? "text" : "password"}
                value={form.password2}
                onChange={handleChange}
                error={errors.password2}
                placeholder="Repeat"
                icon={lockIcon}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPass2((p) => !p)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text-muted)",
                      display: "flex",
                      padding: "2px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color =
                        "var(--color-text-secondary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--color-text-muted)")
                    }
                  >
                    <EyeIcon open={showPass2} />
                  </button>
                }
              />
            </div>

            <div
              className="animate-fade-in-up delay-400"
              style={{ marginTop: "8px" }}
            >
              <button
                type="submit"
                disabled={loading || success}
                className="btn-lift"
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "9px",
                  border: "none",
                  background:
                    loading || success
                      ? "var(--color-border)"
                      : "linear-gradient(135deg, var(--color-accent) 0%, #a8872e 100%)",
                  color:
                    loading || success ? "var(--color-text-muted)" : "#0a0c10",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.04em",
                  cursor: loading || success ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                {loading ? (
                  <>
                    <div
                      className="animate-spin-custom"
                      style={{
                        width: "15px",
                        height: "15px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "var(--color-text-muted)",
                        borderRadius: "50%",
                      }}
                    />
                    Creating account...
                  </>
                ) : success ? (
                  <>
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
                    Account Created!
                  </>
                ) : (
                  <>
                    Create Account{" "}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          <p
            className="animate-fade-in-up delay-400"
            style={{
              marginTop: "24px",
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: "0.75rem",
              lineHeight: 1.6,
            }}
          >
            By registering, you agree to the system's terms of use.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
