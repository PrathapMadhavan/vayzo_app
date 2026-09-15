import { useEffect, useState } from "react";
import { ArrowLeft, Mail, Phone, CalendarDays, UserRound, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { getUserById } from "../api/usersApi";



function UsersDetails() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getUserById(userId);

        if (isMounted) {
          setUser(data);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load user details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <section className="min-h-full bg-background p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
          Loading user details...
        </div>
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="min-h-full bg-background p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm text-danger">{error || "User not found."}</p>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/users")}
            className="mt-4"
          >
            <ArrowLeft size={16} />
            Back to Users
          </Button>
        </div>
      </section>
    );
  }



  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="space-y-4">
        {/* Back */}
        <Button variant="secondary" size="sm" onClick={() => navigate("/users")}>
          <ArrowLeft size={16} />
          Back to Users
        </Button>

        {/* Profile */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-white">
              {user.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold text-foreground">
                  {user.name}
                </h1>


              </div>

              <p className="mt-1 text-xs text-muted">User ID: {user.userId}</p>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto mt-2 sm:mt-0">
              <Button
                size="sm"
                onClick={() => navigate(`/users/edit/${user.userId}`)}
                className="gap-1.5"
              >
                <Pencil size={14} />
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              User Information
            </h2>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem icon={Phone} label="Mobile" value={user.mobileNumber} />

            <DetailItem icon={Mail} label="Email" value={user.email} />

            {user.joinedOn && (
              <DetailItem
                icon={CalendarDays}
                label="Joined On"
                value={user.joinedOn}
              />
            )}

            {user.isVerified !== undefined && (
              <DetailItem
                icon={UserRound}
                label="Verification"
                value={user.isVerified ? "Verified" : "Not Verified"}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
        <Icon size={17} strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-1 truncate text-sm font-medium text-foreground">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default UsersDetails;
