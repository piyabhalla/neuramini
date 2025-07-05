import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebase/firebase";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import { Plus } from "lucide-react";

export default function Chat() {
  const [user, setUser] = useState(null);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else {
        setUser(null);
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "messages"),
      where("uid", "in", [user.uid, "bot"]),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const uploadImageToCloudinary = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: reader.result }),
          });
          const data = await res.json();
          resolve(data.url);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const sendMessage = async () => {
    if ((!input.trim() && !imageFile) || !user) return;
    setLoading(true);

    let imageUrl = null;
    if (imageFile) {
      try {
        imageUrl = await uploadImageToCloudinary(imageFile);
      } catch (err) {
        console.error("Image upload failed:", err);
        setLoading(false);
        return;
      }
    }

    const userMessage = {
      text: input,
      image: imageUrl || null,
      uid: user.uid,
      displayName: user.displayName || "User",
      timestamp: serverTimestamp(),
    };

    setInput("");
    setImageFile(null);
    await addDoc(collection(db, "messages"), userMessage);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, image: imageUrl }),
      });

      const data = await res.json();
      const botMessage = {
        text: data.reply || "⚠ No reply from model.",
        uid: "bot",
        displayName: "NeuraMini",
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, "messages"), botMessage);
    } catch (err) {
      console.error("Bot error:", err);
      await addDoc(collection(db, "messages"), {
        text: "⚠ Sorry, I couldn’t respond.",
        uid: "bot",
        displayName: "NeuraMini",
        timestamp: serverTimestamp(),
      });
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const clearChat = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "messages"),
        where("uid", "in", [user.uid, "bot"])
      );
      const snapshot = await getDocs(q);
      const deletions = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletions);
      setMessages([]);
    } catch (err) {
      console.error("Error clearing chat:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const filteredMessages = messages.filter((msg) =>
    msg.text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        padding: "1rem",
        fontFamily: "sans-serif",
        background: "#0d0d0d",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", color: "#e879f9" }}>🌟 NeuraMini Chat</h1>
        <button
          onClick={handleLogout}
          style={{
            background: "#333",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: 6,
          }}
        >
          Logout
        </button>
      </div>

      {/* Search and Clear */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search chat"
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: 6,
            border: "1px solid #444",
            backgroundColor: "#222",
            color: "#fff",
          }}
        />
        <button
          onClick={clearChat}
          style={{
            background: "#e11d48",
            border: "none",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: 6,
          }}
        >
          Clear Chat
        </button>
      </div>

      {/* Chat Area */}
      <div
        style={{
          flexGrow: 1,
          overflowY: "auto",
          border: "1px solid #444",
          borderRadius: 6,
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        {filteredMessages.map((msg, idx) => {
          const isOwn = msg.uid === user?.uid;
          const isBot = msg.uid === "bot";
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isOwn ? "flex-end" : "flex-start",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  alignSelf: isOwn ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  background: isOwn
                    ? "#f472b622"
                    : isBot
                    ? "#a78bfa22"
                    : "#ffffff0a",
                  border: `1px solid ${
                    isOwn ? "#fb7185" : isBot ? "#c084fc" : "#444"
                  }`,
                  boxShadow: `0 0 10px ${
                    isOwn ? "#fb7185" : isBot ? "#c084fc" : "#222"
                  }`,
                  margin: "0.5rem 0",
                  padding: "0.8rem 1rem",
                  borderRadius: 10,
                  color: "#fff",
                }}
              >
                {msg.text && <ReactMarkdown>{msg.text}</ReactMarkdown>}
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="uploaded"
                    style={{
                      maxWidth: "100%",
                      borderRadius: 8,
                      marginTop: "0.5rem",
                      border: "1px solid #444",
                    }}
                  />
                )}
                {msg.timestamp?.toDate && (
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#aaa",
                      marginTop: "0.25rem",
                      textAlign: "right",
                    }}
                  >
                    {new Date(msg.timestamp.toDate()).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Row */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          style={{ display: "none" }}
          id="upload-image"
        />
        <label htmlFor="upload-image" style={{ cursor: "pointer" }}>
          <Plus color="white" />
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "0.7rem",
            borderRadius: 6,
            border: "1px solid #444",
            backgroundColor: "#222",
            color: "#fff",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            background: loading ? "#444" : "#8b5cf6",
            color: "white",
            padding: "0.7rem 1rem",
            borderRadius: 6,
            border: "none",
          }}
        >
          {loading ? "Typing..." : "Send"}
        </button>
      </div>
    </div>
  );
} 