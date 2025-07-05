import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.push("/login");
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    router.push("/login");
  };

  const goToChat = () => {
    router.push("/chat");
  };

  return (
    <div style={pageStyle}>
      <div style={boxStyle}>
        <h1 style={titleStyle}>Welcome to <span style={{ color: "#00ffff" }}>NeuraMini</span> 🤖</h1>
        <p style={subtitleStyle}>You are logged in! Enjoy your nerdy assistant.</p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={goToChat} style={buttonStyle}>Go to Chat</button>
          <button onClick={handleLogout} style={buttonStyle}>Logout</button>
        </div>
      </div>
    </div>
  );
}

// Styles
const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at center, #001a33, #000)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Fira Code, monospace",
};

const boxStyle = {
  background: "#0e1a2b",
  padding: "3rem",
  borderRadius: "1.5rem",
  color: "#e0f0ff",
  boxShadow: "0 0 30px rgba(0,255,255,0.15)",
  textAlign: "center",
};

const titleStyle = {
  fontSize: "1.8rem",
  marginBottom: "0.5rem",
};

const subtitleStyle = {
  fontSize: "1rem",
  marginBottom: "2rem",
  color: "#ccc",
};

const buttonStyle = {
  padding: "0.7rem 1.2rem",
  borderRadius: "6px",
  border: "1px solid #00ffff",
  backgroundColor: "#001f3f",
  color: "#00ffff",
  fontWeight: "bold",
  cursor: "pointer",
};
