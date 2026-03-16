import axios from "axios";

export const imageUpload = async (imageFile) => {
  if (!imageFile) return null;

  const formData = new FormData();
  formData.append("image", imageFile);

  const imageUploadURL = `https://api.imgbb.com/1/upload?key=${
    import.meta.env.VITE_imgbb_key
  }`;

  try {
    const res = await axios.post(imageUploadURL, formData);
    if (res.data.success) {
      return res.data.data.url;
    }
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error("Image upload failed. Please try again.");
  }
};
