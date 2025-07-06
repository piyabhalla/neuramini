import { useState } from "react";

export default function TestUpload() {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!image) return alert("Please select an image");

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();
      if (data.url) setUrl(data.url);
      else alert("Upload failed");
      setUploading(false);
    };
    reader.readAsDataURL(image);
  };

  return (
    <div style={{ padding: 40, background: "#111", color: "white", minHeight: "100vh" }}>
      <h2>🖼 Test Cloudinary Upload</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        style={{ marginBottom: "1rem" }}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      {url && (
        <div style={{ marginTop: "2rem" }}>
          <h4>✅ Uploaded Image:</h4>
          <img src={url} alt="Uploaded" style={{ maxWidth: 300 }} />
          <p style={{ wordWrap: "break-word" }}>{url}</p>
        </div>
      )}
    </div>
  );
}