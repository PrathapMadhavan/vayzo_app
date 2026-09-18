import { useEffect, useState } from "react";
import { ArrowLeft, Tags, Activity, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { getCategoryById } from "../api/categoriesApi";

const statusBadgeMap = {
  Active: "success",
  Inactive: "danger",
};

function CategoriesDetails() {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCategory = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCategoryById(categoryId);

        if (isMounted) {
          setCategory(data);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load category details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCategory();

    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  if (loading) {
    return (
      <section className="min-h-full bg-background p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
          Loading category details...
        </div>
      </section>
    );
  }

  if (error || !category) {
    return (
      <section className="min-h-full bg-background p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm text-danger">{error || "Category not found."}</p>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/categories")}
            className="mt-4"
          >
            <ArrowLeft size={16} />
            Back to Categories
          </Button>
        </div>
      </section>
    );
  }

  const toTitleCase = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const currentStatus = category.status ? toTitleCase(category.status) : "Active";

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Back */}
        <Button variant="secondary" size="sm" onClick={() => navigate("/categories")}>
          <ArrowLeft size={16} />
          Back to Categories
        </Button>

        {/* Profile */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
              <Tags size={28} />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">
                  {category.name}
                </h1>
                <Badge variant={statusBadgeMap[currentStatus] || "default"}>
                  {currentStatus}
                </Badge>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
                <span className="flex items-center gap-1">
                  ID: {category.categoryId}
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-border sm:block"></span>
                <span className="flex items-center gap-1">
                  Type: {category.type}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:ml-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/categories/edit/${category.id}`)}
              >
                Edit Category
              </Button>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* General Info */}
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              General Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FileText size={16} className="mt-0.5 text-muted shrink-0" />
                <div>
                  <p className="text-xs text-muted">Description</p>
                  <p className="text-sm font-medium text-foreground">
                    {category.description || "No description provided."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tags size={16} className="mt-0.5 text-muted shrink-0" />
                <div>
                  <p className="text-xs text-muted">Items Count</p>
                  <p className="text-sm font-medium text-foreground">
                    {category.itemCount || 0} Items
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity / System Info */}
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              System Info
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-muted shrink-0" />
                <div>
                  <p className="text-xs text-muted">Created Date</p>
                  <p className="text-sm font-medium text-foreground">
                    {category.createdDate ? new Date(category.createdDate).toLocaleDateString() : "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-muted shrink-0" />
                <div>
                  <p className="text-xs text-muted">Parent Category</p>
                  <p className="text-sm font-medium text-foreground">
                    {category.parentCategory || "None"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CategoriesDetails;
