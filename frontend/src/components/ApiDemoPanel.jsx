import { useState } from "react";
import axios from "axios";

// Djoser endpoints + custom admin endpoint for demo
const ENDPOINTS = [
  {
    id: "me",
    label: "GET Profile (me)",
    method: "GET",
    path: "/api/auth/users/me/",
    description:
      "Djoser: Returns the authenticated user's own profile. Requires token.",
    adminOnly: false,
  },
  {
    id: "users",
    label: "GET All Users",
    method: "GET",
    path: "/api/admin/users/",
    description:
      "Custom admin endpoint: Lists all users. Admin/staff only — returns 403 for regular users.",
    adminOnly: true,
  },
  {
    id: "items",
    label: "GET Items",
    method: "GET",
    path: "/api/items/",
    description: "Returns all items. Any authenticated user can access this.",
    adminOnly: false,
  },
];

const StatusBadge = ({ code }) => {
  const color =
    code >= 200 && code < 300
      ? "var(--color-success)"
      : code === 401
        ? "var(--color-error)"
        : code === 403
          ? "#f0a500"
          : "var(--color-error)";

  const label =
    code >= 200 && code < 300
      ? "OK"
      : code === 401
        ? "Unauthorized"
        : code === 403
          ? "Forbidden"
          : "Error";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        backgroundColor: `${color}18`,
        border: `1px solid ${color}40`,
        color,
        fontFamily: "monospace",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: color,
          display: "inline-block",
        }}
      />
      {code} {label}
    </span>
  );
};

const JsonBlock = ({ data }) => {
  const formatted = JSON.stringify(data, null, 2);
  const highlight = (str) =>
    str
      .replace(/"(.*?)":/g, '<span style="color:#c9a84c">"$1"</span>:')
      .replace(/: "(.*?)"/g, ': <span style="color:#9cdcfe">"$1"</span>')
      .replace(/: (true|false)/g, ': <span style="color:#569cd6">$1</span>')
      .replace(/: (\d+)/g, ': <span style="color:#b5cea8">$1</span>')
      .replace(/: null/g, ': <span style="color:#569cd6">null</span>');

  return (
    <pre
      style={{
        margin: 0,
        fontSize: "0.78rem",
        lineHeight: 1.7,
        color: "var(--color-text-secondary)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
      }}
      dangerouslySetInnerHTML={{ __html: highlight(formatted) }}
    />
  );
};

const ApiDemoPanel = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [useAuth, setUseAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async () => {
    setLoading(true);
    setResult(null);

    const token = localStorage.getItem("auth_token");
    const headers = { "Content-Type": "application/json" };
    if (useAuth && token) {
      headers["Authorization"] = `Token ${token}`;
    }

    const startTime = Date.now();
    try {
      const res = await axios({
        method: selectedEndpoint.method,
        url: selectedEndpoint.path,
        headers,
        validateStatus: () => true,
      });
      setResult({
        status: res.status,
        data: res.data,
        duration: Date.now() - startTime,
      });
    } catch (err) {
      setResult({
        status: 0,
        data: { error: err.message },
        duration: Date.now() - startTime,
      });
    } finally {
      setLoading(false);
    }
  };

  const token = localStorage.getItem("auth_token");

  return (
    <div
      className="animate-fade-in-up delay-300"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        overflow: "hidden",
        marginTop: "24px",
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "var(--color-accent-dim)",
              border: "1px solid rgba(201,168,76,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              Djoser API Explorer
            </h3>
            <p
              style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}
            >
              Test Djoser endpoints live — toggle auth to see 401/403 responses
            </p>
          </div>
        </div>

        {/* Auth toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 14px",
            borderRadius: "8px",
            backgroundColor: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
          }}
        >
          <span
            style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}
          >
            Send Auth Token
          </span>
          <button
            onClick={() => {
              setUseAuth((p) => !p);
              setResult(null);
            }}
            style={{
              width: "40px",
              height: "22px",
              borderRadius: "11px",
              border: "none",
              cursor: "pointer",
              backgroundColor: useAuth
                ? "var(--color-accent)"
                : "var(--color-border)",
              position: "relative",
              transition: "background-color 0.2s ease",
              padding: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "3px",
                left: useAuth ? "21px" : "3px",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: useAuth
                  ? "#0a0c10"
                  : "var(--color-text-muted)",
                transition: "left 0.2s ease",
              }}
            />
          </button>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: useAuth ? "var(--color-accent)" : "var(--color-error)",
              letterSpacing: "0.05em",
            }}
          >
            {useAuth ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          minHeight: "400px",
        }}
      >
        {/* Endpoint list */}
        <div
          style={{
            borderRight: "1px solid var(--color-border)",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <p
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              padding: "6px 8px 10px",
              fontWeight: 600,
            }}
          >
            Endpoints
          </p>
          {ENDPOINTS.map((ep) => (
            <button
              key={ep.id}
              onClick={() => {
                setSelectedEndpoint(ep);
                setResult(null);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: "8px",
                border: `1px solid ${selectedEndpoint.id === ep.id ? "rgba(201,168,76,0.3)" : "transparent"}`,
                backgroundColor:
                  selectedEndpoint.id === ep.id
                    ? "var(--color-accent-dim)"
                    : "transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (selectedEndpoint.id !== ep.id)
                  e.currentTarget.style.backgroundColor =
                    "var(--color-surface-2)";
              }}
              onMouseLeave={(e) => {
                if (selectedEndpoint.id !== ep.id)
                  e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div
                className="flex items-center gap-2"
                style={{ marginBottom: "4px" }}
              >
                <span
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "#4caf82",
                    fontFamily: "monospace",
                  }}
                >
                  {ep.method}
                </span>
                {ep.adminOnly && (
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: "var(--color-accent)",
                      backgroundColor: "var(--color-accent-dim)",
                      padding: "1px 5px",
                      borderRadius: "4px",
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: "0.78rem",
                  color:
                    selectedEndpoint.id === ep.id
                      ? "var(--color-text-primary)"
                      : "var(--color-text-secondary)",
                  fontWeight: selectedEndpoint.id === ep.id ? 500 : 400,
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                }}
              >
                {ep.path}
              </p>
            </button>
          ))}
        </div>

        {/* Request / Response area */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* URL bar */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "5px",
                backgroundColor: "rgba(76,175,130,0.12)",
                border: "1px solid rgba(76,175,130,0.25)",
                color: "#4caf82",
                fontSize: "0.72rem",
                fontWeight: 700,
                fontFamily: "monospace",
                letterSpacing: "0.06em",
              }}
            >
              {selectedEndpoint.method}
            </span>
            <div
              style={{
                flex: 1,
                padding: "8px 14px",
                borderRadius: "8px",
                backgroundColor: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                fontFamily: "monospace",
                fontSize: "0.82rem",
                color: "var(--color-text-secondary)",
              }}
            >
              <span style={{ color: "var(--color-text-muted)" }}>
                localhost:5173
              </span>
              <span style={{ color: "var(--color-accent)" }}>
                {selectedEndpoint.path}
              </span>
            </div>
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                padding: "9px 20px",
                borderRadius: "8px",
                border: "none",
                background: loading
                  ? "var(--color-border)"
                  : "linear-gradient(135deg, var(--color-accent), #a8872e)",
                color: loading ? "var(--color-text-muted)" : "#0a0c10",
                fontSize: "0.82rem",
                fontWeight: 700,
                fontFamily: "var(--font-body)",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "var(--color-text-muted)",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Sending...
                </>
              ) : (
                <>
                  Send{" "}
                  <svg
                    width="13"
                    height="13"
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

          {/* Request headers preview */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid var(--color-border)",
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
          >
            <p
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Request Headers
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {[
                { key: "Content-Type", val: "application/json", always: true },
              ].map(({ key, val }) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    gap: "12px",
                    fontSize: "0.78rem",
                    fontFamily: "monospace",
                  }}
                >
                  <span
                    style={{
                      color: "var(--color-text-muted)",
                      minWidth: "140px",
                    }}
                  >
                    {key}
                  </span>
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    {val}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  fontSize: "0.78rem",
                  fontFamily: "monospace",
                }}
              >
                <span
                  style={{
                    color: "var(--color-text-muted)",
                    minWidth: "140px",
                  }}
                >
                  Authorization
                </span>
                {useAuth && token ? (
                  <span style={{ color: "var(--color-accent)" }}>
                    Token {token.slice(0, 12)}
                    <span style={{ color: "var(--color-text-muted)" }}>
                      ••••••••••••••••••••••••••••
                    </span>
                  </span>
                ) : (
                  <span
                    style={{
                      color: "var(--color-error)",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    not included
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Response area */}
          <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>
            {!result && !loading && (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  color: "var(--color-text-muted)",
                  minHeight: "180px",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <p style={{ fontSize: "0.85rem" }}>
                  Press{" "}
                  <strong style={{ color: "var(--color-text-secondary)" }}>
                    Send
                  </strong>{" "}
                  to make a request
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    textAlign: "center",
                    maxWidth: "280px",
                  }}
                >
                  {selectedEndpoint.description}
                </p>
              </div>
            )}

            {result && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <p
                      style={{
                        fontSize: "0.65rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--color-text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      Response
                    </p>
                    <StatusBadge code={result.status} />
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--color-text-muted)",
                      fontFamily: "monospace",
                    }}
                  >
                    {result.duration}ms
                  </span>
                </div>

                {result.status === 401 && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-error-dim)",
                      border: "1px solid rgba(224,82,82,0.25)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-error)"
                      strokeWidth="2"
                      style={{ marginTop: "1px", flexShrink: 0 }}
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div>
                      <p
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: "var(--color-error)",
                          marginBottom: "2px",
                        }}
                      >
                        401 Unauthorized — No valid token
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(224,82,82,0.7)",
                        }}
                      >
                        Djoser rejected the request. Toggle auth ON and resend.
                      </p>
                    </div>
                  </div>
                )}

                {result.status === 403 && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(240,165,0,0.08)",
                      border: "1px solid rgba(240,165,0,0.25)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f0a500"
                      strokeWidth="2"
                      style={{ marginTop: "1px", flexShrink: 0 }}
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <div>
                      <p
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: "#f0a500",
                          marginBottom: "2px",
                        }}
                      >
                        403 Forbidden — Admin access required
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(240,165,0,0.7)",
                        }}
                      >
                        You are authenticated but lack admin privileges for this
                        endpoint.
                      </p>
                    </div>
                  </div>
                )}

                {result.status >= 200 && result.status < 300 && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "8px",
                      backgroundColor: "rgba(76,175,130,0.08)",
                      border: "1px solid rgba(76,175,130,0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-success)"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--color-success)",
                        fontWeight: 500,
                      }}
                    >
                      Request successful — Djoser token accepted
                    </p>
                  </div>
                )}

                <div
                  style={{
                    backgroundColor: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    padding: "16px",
                    overflowX: "auto",
                  }}
                >
                  <JsonBlock data={result.data} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDemoPanel;
