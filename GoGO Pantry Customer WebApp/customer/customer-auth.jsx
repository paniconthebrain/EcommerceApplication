/* GoGO Pantry — Customer Authentication Pages (Login & Signup) */

function CustomerLogin({ onLoginSuccess, onSignupClick, onForgotClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      if (email && password.length >= 6) {
        const userData = { id: Date.now(), email, name: email.split("@")[0] };
        localStorage.setItem("customerAuth", JSON.stringify(userData));
        onLoginSuccess(userData);
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    }, 600);
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
          <div style={{
            background: "var(--red-100)",
            color: "var(--red-700)",
            padding: "12px 14px",
            borderRadius: 10,
            fontSize: 13,
            marginBottom: 16,
            border: "1px solid var(--red-300)"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <AuthField label="Email address">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={authInputStyle}
            />
          </AuthField>

          <AuthField label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={authInputStyle}
            />
          </AuthField>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, fontSize: 13 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" style={{ cursor: "pointer" }} />
              <span style={{ color: "var(--text-2)" }}>Remember me</span>
            </label>
            <button
              onClick={onForgotClick}
              style={{ background: "none", border: "none", color: "var(--primary)", textDecoration: "none", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "var(--font-sans)" }}
            >
              Forgot password?
            </button>
          </div>

          <BtnC
            full
            type="submit"
            style={{ marginBottom: 16, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </BtnC>
        </form>

        <div style={{ textAlign: "center", color: "var(--text-2)", fontSize: 13 }}>
          Don't have an account?{" "}
          <button
            onClick={onSignupClick}
            style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, textDecoration: "none", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-sans)" }}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerSignup({ onSignupSuccess, onLoginClick }) {
  const [step, setStep] = useState(1); // 1: form, 2: verification, 3: complete
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.includes("@")) return "Valid email is required";
    if (!formData.phone.match(/^\d{10}$/)) return "Phone must be 10 digits";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords don't match";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 600);
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      const userData = { id: Date.now(), email: formData.email, name: formData.name };
      localStorage.setItem("customerAuth", JSON.stringify(userData));
      onSignupSuccess(userData);
    }, 600);
  };

  if (step === 2) {
    return (
      <div style={authContainerStyle}>
        <div style={authCardStyle}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h1 style={authHeadingStyle}>Verify your email</h1>
            <p style={authSubtitleStyle}>We've sent a verification link to {formData.email}</p>
          </div>

          <div style={{
            background: "var(--surface-2)",
            padding: "20px",
            borderRadius: 12,
            marginBottom: 20,
            textAlign: "center",
            fontSize: 13,
            color: "var(--text-2)"
          }}>
            Check your inbox and click the verification link to complete signup.
          </div>

          <BtnC
            full
            onClick={handleVerify}
            style={{ marginBottom: 12, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Completing..." : "I've verified my email"}
          </BtnC>

          <button
            onClick={() => setStep(1)}
            style={{
              width: "100%",
              padding: "11px 16px",
              background: "transparent",
              color: "var(--primary)",
              border: "1px solid var(--primary)",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-sans)"
            }}
          >
            Back to signup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={authContainerStyle}>
      <div style={authCardStyle}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <LogoCustomer size={32} />
        </div>
        <h1 style={authHeadingStyle}>Create your account</h1>
        <p style={authSubtitleStyle}>Join GoGO Pantry for fast, fresh grocery delivery</p>

        {error && (
          <div style={{
            background: "var(--red-100)",
            color: "var(--red-700)",
            padding: "12px 14px",
            borderRadius: 10,
            fontSize: 13,
            marginBottom: 16,
            border: "1px solid var(--red-300)"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <AuthField label="Full name">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="John Doe"
              style={authInputStyle}
            />
          </AuthField>

          <AuthField label="Email address">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="you@example.com"
              style={authInputStyle}
            />
          </AuthField>

          <AuthField label="Phone number">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="9876543210"
              style={authInputStyle}
              maxLength="10"
            />
          </AuthField>

          <AuthField label="Password">
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="••••••••"
              style={authInputStyle}
            />
          </AuthField>

          <AuthField label="Confirm password">
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="••••••••"
              style={authInputStyle}
            />
          </AuthField>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 20, fontSize: 13, color: "var(--text-2)" }}>
            <input type="checkbox" style={{ marginTop: 3, cursor: "pointer" }} required />
            <span>I agree to the Terms of Service and Privacy Policy</span>
          </label>

          <BtnC
            full
            type="submit"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating account..." : "Create account"}
          </BtnC>
        </form>

        <div style={{ textAlign: "center", color: "var(--text-2)", fontSize: 13, marginTop: 16 }}>
          Already have an account?{" "}
          <button
            onClick={onLoginClick}
            style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, textDecoration: "none", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-sans)" }}
          >
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 600);
  };

  if (sent) {
    return (
      <div style={authContainerStyle}>
        <div style={authCardStyle}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
            <h1 style={authHeadingStyle}>Check your email</h1>
            <p style={authSubtitleStyle}>We've sent password reset instructions to {email}</p>
            <div style={{
              background: "var(--surface-2)",
              padding: "20px",
              borderRadius: 12,
              marginTop: 20,
              marginBottom: 20,
              textAlign: "center",
              fontSize: 13,
              color: "var(--text-2)"
            }}>
              Click the link in your email to reset your password. The link expires in 24 hours.
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
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-2)",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 20,
            fontFamily: "var(--font-sans)"
          }}
        >
          ← Back to login
        </button>
        <h1 style={authHeadingStyle}>Reset your password</h1>
        <p style={authSubtitleStyle}>Enter your email to receive a password reset link</p>

        <form onSubmit={handleSubmit}>
          <AuthField label="Email address">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={authInputStyle}
              required
            />
          </AuthField>

          <BtnC
            full
            type="submit"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Sending..." : "Send reset link"}
          </BtnC>
        </form>
      </div>
    </div>
  );
}

function AuthField({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const authContainerStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background: "var(--bg)",
  padding: "20px",
  backgroundImage: "radial-gradient(80% 80% at 50% 0%, oklch(0.24 0.025 152) 0%, var(--bg) 60%)"
};

const authCardStyle = {
  width: "100%",
  maxWidth: "420px",
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "20px",
  padding: "40px 36px",
  boxShadow: "var(--shadow-lg)"
};

const authHeadingStyle = {
  fontSize: 24,
  fontWeight: 800,
  letterSpacing: "-0.02em",
  margin: "0 0 8px",
  color: "var(--text)",
  textAlign: "center"
};

const authSubtitleStyle = {
  color: "var(--text-2)",
  margin: "0 0 24px",
  fontSize: 14.5,
  textAlign: "center",
  lineHeight: 1.5
};

const authInputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 11,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: 15,
  fontFamily: "var(--font-sans)",
  outline: "none",
  transition: "all .2s"
};

Object.assign(window, {
  CustomerLogin,
  CustomerSignup,
  ForgotPassword,
  AuthField
});
