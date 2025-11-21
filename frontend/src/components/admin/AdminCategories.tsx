import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/css/admincate.css";

interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

const token = localStorage.getItem("accessToken");

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: token ? { Authorization: `Bearer ${token}` } : {},
  withCredentials: true,
});

const generateSlug = (text: string) =>
  text.toLowerCase().trim().replace(/ /g, "-").replace(/[^\w-]+/g, "");

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState<Category>({
    id: "",
    parent_id: null,
    name: "",
    slug: "",
    description: "",
    image: "",
    icon: "",
    display_order: 0,
    is_active: true,
  });

  const fetchCategories = () => {
    axiosInstance
      .get("/categories")
      .then((res) => {
        setCategories(res.data);
        setErrorMsg("");
      })
      .catch((err) => {
        setErrorMsg(
          err.response?.status === 401
            ? "Token hết hạn hoặc không hợp lệ."
            : "Không thể tải danh mục."
        );
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setFormData({
      id: "",
      parent_id: null,
      name: "",
      slug: "",
      description: "",
      image: "",
      icon: "",
      display_order: 0,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setFormData(cat);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert("Tên danh mục không được để trống!");
      return;
    }

    const payload = {
      ...formData,
      slug: formData.slug.trim() || generateSlug(formData.name),
      parent_id: formData.parent_id ? formData.parent_id : null,
    };
    delete (payload as any).id;

    const request = formData.id
      ? axiosInstance.put(`/categories/${formData.id}`, payload)
      : axiosInstance.post("/categories", payload);

    request
      .then(() => {
        setModalOpen(false);
        fetchCategories();
      })
      .catch((err) => {
        console.error("❌ Lỗi backend:", err.response?.data);
        setErrorMsg(
          err.response?.data?.message || "Không thể lưu danh mục. Kiểm tra dữ liệu."
        );
      });
  };

  // --- Chức năng xóa ---
const handleDelete = (id: string) => {
  if (!id) {
    alert("Không tìm thấy ID danh mục để xóa!");
    return;
  }

  if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
    axiosInstance
      .delete(`/categories/${id}`)
      .then(() => {
        alert("Xóa thành công!");
        fetchCategories();
      })
      .catch((err) => {
        console.error("❌ Lỗi xóa:", err.response?.data);
        setErrorMsg("Không thể xóa danh mục. Kiểm tra quyền truy cập hoặc dữ liệu.");
      });
  }
};


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📁 Quản lý Danh mục</h2>

      {errorMsg && <div style={{ color: "red", marginBottom: "10px" }}>{errorMsg}</div>}

      <button
        onClick={openAddModal}
        style={{
          padding: "10px 15px",
          marginBottom: "20px",
          cursor: "pointer",
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        ➕ Thêm danh mục
      </button>

      <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th>ID</th>
            <th>Tên</th>
            <th>Slug</th>
            <th>Thứ tự</th>
            <th>Hiển thị</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.slug}</td>
              <td>{c.display_order}</td>
              <td>{c.is_active ? "✔" : "✖"}</td>
              <td>
                <button
                  onClick={() => openEditModal(c)}
                  style={{ padding: "5px 10px", marginRight: "5px", cursor: "pointer" }}
                >
                  ✏️ Sửa
                </button>
                <td>
  <button onClick={() => handleDelete(c._id)}>❌ Xóa</button>
</td>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: "450px",
              background: "white",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>{formData.id ? "Sửa danh mục" : "Thêm danh mục"}</h3>

            <label>Tên danh mục</label>
            <input name="name" value={formData.name} onChange={handleChange} className="input" />

            <label>Slug</label>
            <input name="slug" value={formData.slug} onChange={handleChange} className="input" />

            <label>Mô tả</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="input" rows={3} />

            <label>Image URL</label>
            <input name="image" value={formData.image} onChange={handleChange} className="input" />

            <label>Icon</label>
            <input name="icon" value={formData.icon} onChange={handleChange} className="input" />

            <label>Thứ tự hiển thị</label>
            <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className="input" />

            <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
              Hoạt động
            </label>

            <label>Danh mục cha</label>
            <select name="parent_id" value={formData.parent_id || ""} onChange={handleChange} className="input">
              <option value="">-- Không có --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button onClick={() => setModalOpen(false)} style={{ marginRight: "10px" }}>Hủy</button>
              <button
                onClick={handleSave}
                style={{ background: "#007bff", color: "white", padding: "6px 12px", borderRadius: "4px" }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
