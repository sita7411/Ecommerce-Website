import { useState, useEffect } from "react";

const ChangeLogo = () => {
  const [logoPreview, setLogoPreview] = useState("/logo.png"); // default
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;


  // ✅ Fetch current logo from backend on mount
  useEffect(() => {
    const fetchLogo = async () => {
      try {
      const res = await fetch(`${API_URL}/api/logo`);
        const data = await res.json();
        if (data.success && data.logo) {
          setLogoPreview(data.logo.url);
        }
      } catch (err) {
        console.error("Error fetching logo:", err);
      }
    };
    fetchLogo();
  }, []);

  // ✅ Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Upload to backend
  const handleSave = async () => {
    if (!selectedFile) {
      alert("Please select a logo to upload!");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("logo", selectedFile);

    const res = await fetch(`${API_URL}/api/logo`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.logo) {
        setLogoPreview(data.logo.url);
        alert("✅ Logo uploaded successfully!");
        setSelectedFile(null);
      } else {
        alert("❌ Upload failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error uploading logo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-8">
       <h1 className="text-3xl font-bold text-[#e65a00] mb-2">Change Logo</h1>
<p className="text-[#666666]">
  Update your website logo to reflect your brand. Supported formats: PNG, JPG, SVG.
</p>

      </div>

      {/* Card */}
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-3xl w-full mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Logo Preview */}
          <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-[#ff6600] transition">
            <img
              src={logoPreview}
              alt="Logo Preview"
              className="object-contain w-full h-full"
            />
          </div>

          {/* Upload Section */}
          <div className="flex-1 flex flex-col gap-4">
            <label className="block">
              <span className="text-gray-700 font-semibold mb-2">Upload New Logo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-gray-700 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#ff6600] transition"
              />
            </label>
            <p className="text-sm text-gray-500">
              Recommended size: 200x200px. Max file size: 2MB.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-4 justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#ff6600] text-white px-6 py-2 rounded-lg hover:bg-[#e65c00] transition shadow-md disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Save"}
          </button>
          <button
            onClick={() => setSelectedFile(null)}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition shadow-sm"
          >
            Cancel
          </button>
        </div>
      </div>

      <p className="text-gray-400 text-sm mt-6 text-center">
        Changing the logo will reflect across the entire admin panel and website header.
      </p>
    </div>
  );
};

export default ChangeLogo;
