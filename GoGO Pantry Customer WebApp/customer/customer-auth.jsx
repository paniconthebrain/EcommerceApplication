/* GoGO Pantry — Customer Authentication Pages (Login, Signup, Forgot Password) */

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function CustomerLogin({ onLoginSuccess, onSignupClick, onForgotClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customers/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid email or password"); return; }
      localStorage.setItem("customerToken", data.token);
      localStorage.setItem("customerRefreshToken", data.refreshToken || "");
      localStorage.setItem("customerAuth", JSON.stringify(data.customer));
      onLoginSuccess(data.customer);
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authContainerStyle}>
      <div style={authCardStyle}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <LogoCustomer size={32} />
        </div>
        <h1 style={authHeadingStyle}>Sign in to your account</h1>
        <p style={authSubtitleStyle}>Welcome back! Order fresh groceries delivered to your door.</p>

        {error && (
          <div style={{ background:"var(--red-100)", color:"var(--red-700)", padding:"12px 14px",
            borderRadius:10, fontSize:13, marginBottom:16, border:"1px solid var(--red-300)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <AuthField label="Email address">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={authInputStyle} required />
          </AuthField>
          <AuthField label="Password">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={authInputStyle} required />
          </AuthField>

          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:20, fontSize:13 }}>
            <button onClick={onForgotClick} type="button"
              style={{ background:"none", border:"none", color:"var(--primary)",
                fontWeight:600, cursor:"pointer", fontSize:13, fontFamily:"var(--font-sans)" }}>
              Forgot password?
            </button>
          </div>

          <BtnC full type="submit" style={{ marginBottom:16, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in..." : "Sign in"}
          </BtnC>
        </form>

        <div style={{ textAlign:"center", color:"var(--text-2)", fontSize:13 }}>
          Don't have an account?{" "}
          <button onClick={onSignupClick}
            style={{ background:"none", border:"none", color:"var(--primary)",
              fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"var(--font-sans)" }}>
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerSignup({ onSignupSuccess, onLoginClick }) {
  const [formData, setFormData] = useState(
    { name:"", email:"", phone:"", password:"", confirmPassword:"" }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.includes("@")) return "Valid email is required";
    if (formData.phone && !formData.phone.match(/^\d{7,15}$/))
      return "Phone must be 7-15 digits";
    if (!PASSWORD_REGEX.test(formData.password))
      return "Password must be 8+ characters with uppercase, lowercase, and a number";
    if (formData.password !== formData.confirmPassword) return "Passwords don't match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customers/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          name: formData.name,
          phone: formData.phone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed. Please try again."); return; }
      localStorage.setItem("customerToken", data.token);
      localStorage.setItem("customerRefreshToken", data.refreshToken || "");
      localStorage.setItem("customerAuth", JSON.stringify(data.customer));
      onSignupSuccess(data.customer);
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authContainerStyle}>
      <div style={authCardStyle}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
          <LogoCustomer size={32} />
        </div>
        <h1 style={authHeadingStyle}>Create your account</h1>
        <p style={authSubtitleStyle}>Join GoGO Pantry for fast, fresh grocery delivery</p>

        {error && (
          <div style={{ background:"var(--red-100)", color:"var(--red-700)", padding:"12px 14px",
            borderRadius:10, fontSize:13, marginBottom:16, border:"1px solid var(--red-300)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <AuthField label="Full name">
            <input type="text" value={formData.name}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="John Doe" style={authInputStyle} maxLength={100} />
          </AuthField>
          <AuthField label="Email address">
            <input type="email" value={formData.email}
              onChange={e => handleChange("email", e.target.value)}
              placeholder="you@example.com" style={authInputStyle} required />
          </AuthField>
          <AuthField label="Phone number (optional)">
            <input type="tel" value={formData.phone}
              onChange={e => handleChange("phone", e.target.value)}
              placeholder="9876543210" style={authInputStyle} maxLength={15} />
          </AuthField>
          <AuthField label="Password">
            <input type="password" value={formData.password}
              onChange={e => handleChange("password", e.target.value)}
              placeholder="Min 8 chars, upper, lower, number" style={authInputStyle} />
          </AuthField>
          <AuthField label="Confirm password">
            <input type="password" value={formData.confirmPassword}
              onChange={e => handleChange("confirmPassword", e.target.value)}
              placeholder="••••••••" style={authInputStyle} />
          </AuthField>

          <label style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:20,
            fontSize:13, color:"var(--text-2)" }}>
            <input type="checkbox" style={{ marginTop:3, cursor:"pointer" }} required />
            <span>I agree to the Terms of Service and Privacy Policy</span>
          </label>

          <BtnC full type="submit" style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating account..." : "Create account"}
          </BtnC>
        </form>

        <div style={{ textAlign:"center", color:"var(--text-2)", fontSize:13, marginTop:16 }}>
          Already have an account?{" "}
          <button onClick={onLoginClick}
            style={{ background:"none", border:"none", color:"var(--primary)",
              fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"var(--font-sans)" }}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email address"); return; }
    setLoading(true);
    setError("");
    try {
      await fetch(`${API_BASE}/customers/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show success — don't reveal if email exists
      setSent(true);
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={authContainerStyle}>
        <div style={authCardStyle}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>✉️</div>
            <h1 style={authHeadingStyle}>Check your email</h1>
            <p style={authSubtitleStyle}>
              If an account exists for {email}, a reset link has been sent.
            </p>
            <div style={{ background:"var(--surface-2)", padding:20, borderRadius:12,
              marginTop:20, marginBottom:20, fontSize:13, color:"var(--text-2)" }}>
              Click the link in your email to reset your password. The link expires in 1 hour.
            </div>
            <BtnC full onClick={onBack}>Back to login</BtnC>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={authContainerStyle}>
      <div style={authCardStyle}>
        <button onClick={onBack}
          style={{ background:"none", border:"none", color:"var(--text-2)", cursor:"pointer",
            fontSize:14, fontWeight:600, marginBottom:20, fontFamily:"var(--font-sans)" }}>
          ← Back to login
        </button>
        <h1 style={authHeadingStyle}>Reset your password</h1>
        <p style={authSubtitleStyle}>Enter your email to receive a password reset link</p>

        {error && (
          <div style={{ background:"var(--red-100)", color:"var(--red-700)", padding:"12px 14px",
            borderRadius:10, fontSize:13, marginBottom:16, border:"1px solid var(--red-300)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <AuthField label="Email address">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={authInputStyle} required />
          </AuthField>
          <BtnC full type="submit" style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? "Sending..." : "Send reset link"}
          </BtnC>
        </form>
      </div>
    </div>
  );
}

function AuthField({ label, children }) {
  return (
    <label style={{ display:"block", marginBottom:16 }}>
      <span style={{ display:"block", fontSize:13.5, fontWeight:600,
        color:"var(--text)", marginBottom:8 }}>{label}</span>
      {children}
    </label>
  );
}

const authContainerStyle = {
  minHeight:"100vh", display:"grid", placeItems:"center", background:"var(--bg)",
  padding:"20px",
  backgroundImage:"radial-gradient(80% 80% at 50% 0%, oklch(0.24 0.025 152) 0%, var(--bg) 60%)"
};
const authCardStyle = {
  width:"100%", maxWidth:"420px", background:"var(--surface)",
  border:"1px solid var(--line)", borderRadius:"20px", padding:"40px 36px",
  boxShadow:"var(--shadow-lg)"
};
const authHeadingStyle = {
  fontSize:24, fontWeight:800, letterSpacing:"-0.02em",
  margin:"0 0 8px", color:"var(--text)", textAlign:"center"
};
const authSubtitleStyle = {
  color:"var(--text-2)", margin:"0 0 24px", fontSize:14.5,
  textAlign:"center", lineHeight:1.5
};
const authInputStyle = {
  width:"100%", padding:"12px 14px", borderRadius:11, border:"1px solid var(--line)",
  background:"var(--surface)", color:"var(--text)", fontSize:15,
  fontFamily:"var(--font-sans)", outline:"none", transition:"all .2s"
};

Object.assign(window, { CustomerLogin, CustomerSignup, ForgotPassword, AuthField });
