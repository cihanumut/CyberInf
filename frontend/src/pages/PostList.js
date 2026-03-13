import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { blogService, categoryService } from "../utils/api";

export default function PostList() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("category") || "";
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    categoryService
      .getCategories()
      .then((r) => setCategories(r.data.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (search) params.search = search;

    const fetchFn = categoryId
      ? categoryService.getCategoryBlogs(categoryId, params)
      : blogService.getBlogs(params);

    fetchFn
      .then((r) => {
        setBlogs(r.data.blogs || []);
        setPagination(r.data.pagination || {});
      })
      .finally(() => setLoading(false));
  }, [search, categoryId, page]);

  const setParam = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value) params[key] = value;
    else delete params[key];
    delete params.page;
    setSearchParams(params);
  };

  return (
    <div className="container page-section">
      <h1 className="page-title">
        <span>//</span> Tüm Yazılar
      </h1>

      {/* ARAMA VE FİLTRELEME ALANI */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap", // Mobilde alt alta inmesini sağlar
          alignItems: "center",
        }}
      >
        <div style={{ flex: "1 1 300px", minWidth: "250px" }}> {/* Arama kutusu esnek yapıldı */}
          <input
            className="form-input"
            style={{ width: "100%" }}
            placeholder="Ara..."
            defaultValue={search}
            onKeyDown={(e) =>
              e.key === "Enter" && setParam("search", e.target.value)
            }
          />
        </div>
        
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", flex: "2 1 auto" }}>
          <button
            className={`btn btn-sm ${!categoryId ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setParam("category", "")}
          >
            Tümü
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`btn btn-sm ${categoryId === c.id ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setParam("category", c.id)}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "3rem" }}
        >
          <div className="spinner" />
        </div>
      ) : blogs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius-lg)"
          }}
        >
          Yazı bulunamadı.
        </div>
      ) : (
        <div className="grid-3">
          {blogs.map((blog) => (
            <Link
              key={blog._id}
              to={`/posts/${blog.slug}`}
              style={{ textDecoration: "none", display: "block", height: "100%" }}
            >
              {/* KART DÜZENİ: Home bileşenindeki esnek yapı buraya da uygulandı */}
              <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {blog.coverImage && (
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderRadius: "var(--radius-md)",
                      marginBottom: "1rem",
                    }}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  {blog.category && (
                    <span className="badge badge-blue">
                      {blog.category?.name || blog.category}
                    </span>
                  )}
                  {blog.tags?.slice(0, 2).map((t) => (
                    <span key={t} className="badge badge-green">
                      {t}
                    </span>
                  ))}
                </div>
                <h2
                  style={{
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1.4
                  }}
                >
                  {blog.title}
                </h2>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    marginBottom: "1.25rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {blog.excerpt}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                    marginTop: "auto", // Yazar ve tarihi en alta iter
                  }}
                >
                  <Link
                    to={`/profile/${blog.author?._id}`}
                    style={{
                      color: "var(--accent-green)",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "60%"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{blog.author?.username}
                  </Link>
                  <span style={{ whiteSpace: "nowrap" }}>{blog.readTime} dk okuma</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* SAYFALAMA (PAGINATION) */}
      {pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "2.5rem",
            flexWrap: "wrap", // Sayfa numaraları çoksa mobilde alt alta inmesini sağlar
          }}
        >
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`btn btn-sm ${page === i + 1 ? "btn-primary" : "btn-secondary"}`}
              onClick={() =>
                setSearchParams({
                  ...Object.fromEntries(searchParams),
                  page: i + 1,
                })
              }
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
