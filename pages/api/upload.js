import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dgbxc4vhg',
  api_key: '834952359572375',
  api_secret: 'NfZ5EX0a93YFPp4VUKIzkxrQZbc',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: 'chatbot_uploads',
    });

    console.log("📡 Cloudinary Upload Response:", result); // ✅ Debug log

    return res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("❌ Cloudinary Upload Error:", err); // ✅ Log the error too
    return res.status(500).json({ error: 'Upload failed', details: err.message });
  }
}