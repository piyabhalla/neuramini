// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password !== confirm) return setError("Passwords do not match.");
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/chat");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/chat");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = async () => {
    if (!email) return setError("Enter your email first.");
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent.");
  };

  return (
    <div style={pageStyle}>
      <div style={boxStyle}>
        <h1 style={welcomeStyle}>Welcome to NeuraMini 💬</h1>
        <p style={taglineStyle}>Your geeky companion for all things tech.</p>
        <h2 style={formTitle}>{isLogin ? "Login" : "Sign Up"}</h2>

        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              required
              onChange={(e) => setConfirm(e.target.value)}
              style={inputStyle}
            />
          )}

          <div style={linkWrap}>
            <span onClick={handleReset} style={linkStyle}>Forgot password?</span>
          </div>

          <button type="submit" style={buttonStyle}>
            {isLogin ? "Login" : "Sign Up"}
          </button>
          <button type="button" onClick={handleGoogle} style={googleStyle}>
            Continue with Google
          </button>

          {error && <p style={errorStyle}>{error}</p>}
        </form>

        <p style={switchText}>
          {isLogin ? "Don't have an account?" : "Already a member?"}
          <span onClick={toggleMode} style={linkStyle}>
            {isLogin ? " Sign Up" : " Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

// 🔧 STYLES
const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(to bottom right, #000, #0b0b3b)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "'Fira Code', monospace",
  padding: "1rem",
};

const boxStyle = {
  background: "#111",
  borderRadius: "1rem",
  padding: "2rem",
  maxWidth: "400px",
  width: "100%",
  color: "#fff",
  boxShadow: "0 0 25px rgba(0,255,255,0.1)",
};

const welcomeStyle = {
  fontSize: "1.6rem",
  color: "#00ffff",
  marginBottom: "0.3rem",
  textAlign: "center",
};

const taglineStyle = {
  textAlign: "center",
  fontSize: "0.95rem",
  color: "#aaa",
  marginBottom: "1.5rem",
};

const formTitle = {
  textAlign: "center",
  fontSize: "1.2rem",
  marginBottom: "1rem",
  color: "#fff",
};

const inputStyle = {
  width: "100%",
  padding: "0.7rem",
  borderRadius: "5px",
  background: "#0a0a2a",
  border: "1px solid #00ffff",
  color: "#00ffff",
  fontSize: "0.9rem",
  marginBottom: "1rem",
};

const buttonStyle = {
  width: "100%",
  padding: "0.7rem",
  background: "#00ffff",
  color: "#000",
  fontWeight: "bold",
  fontSize: "1rem",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  marginBottom: "0.8rem",
};

const googleStyle = {
  ...buttonStyle,
  background: "#0055ff",
  color: "#fff",
};

const errorStyle = {
  color: "#ff4f4f",
  textAlign: "center",
  marginTop: "1rem",
};

const linkWrap = {
  textAlign: "right",
  marginBottom: "1rem",
};

const linkStyle = {
  color: "#00ffff",
  cursor: "pointer",
  fontSize: "0.85rem",
};

const switchText = {
  textAlign: "center",
  color: "#ccc",
  marginTop: "1.2rem",
  fontSize: "0.9rem",
};

