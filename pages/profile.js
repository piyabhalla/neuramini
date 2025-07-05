import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { db } from "../firebase/firestore";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarData, setAvatarData] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (curr) => {
      if (!curr) return router.push("/login");
      setUser(curr);
      const docSnap = await getDoc(doc(db, "users", curr.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || "");
        setAvatarData(data.avatar || "");
      }
    });
    return () => unsub();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Name is required.");
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        name,
        avatar: avatarData,
        email: user.email,
      });
      alert("Profile saved!");
      router.push("/chat");
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Set Up Your Profile</h2>

        <div style={styles.avatarWrap}>
          {avatarData ? (
            <img src={avatarData} alt="avatar" style={styles.avatar} />
          ) : (
            <div style={styles.placeholder}>No Avatar</div>
          )}
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
        </div>

        <input
          type="text"
          placeholder="Enter your display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleSave} disabled={loading} style={styles.button}>
          {loading ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0a, #1a0033)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
    fontFamily: "Fira Code, monospace",
  },
  card: {
    background: "#111",
    padding: "2rem",
    borderRadius: "1rem",
    width: "100%",
    maxWidth: "420px",
    color: "#fff",
    boxShadow: "0 0 20px rgba(0,255,255,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
    fontSize: "1.5rem",
    color: "#00ffff",
  },
  avatarWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.6rem",
    marginBottom: "1rem",
  },
  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    border: "2px solid #00ffff",
    objectFit: "cover",
  },
  placeholder: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "#333",
    color: "#aaa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
  },
  input: {
    width: "100%",
    padding: "0.7rem",
    borderRadius: "6px",
    border: "1px solid #00ffff",
    background: "#1b1b1b",
    color: "#00ffff",
    marginBottom: "1rem",
  },
  button: {
    width: "100%",
    padding: "0.7rem",
    borderRadius: "6px",
    background: "#00ffff",
    color: "#000",
    fontWeight: "bold",
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
  },
};
