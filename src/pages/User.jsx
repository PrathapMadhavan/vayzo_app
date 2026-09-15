import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, MoreVertical, Pencil } from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { users } from "../mock/vayzoApiMock";

const statusBadgeMap = {
  ACTIVE: "success",
  VERIFIED: "info",
  PENDING: "warning",
  BLOCKED: "danger",
};

const statusOptions = ["All Status", "Active", "Verified", "Pending", "Blocked"];
const userTypeOptions = [
  "All User Type",
  "Customer",
  "Business",
  "Delivery Partner",
  "Merchant",
];
const verificationOptions = ["All Verified", "Verified", "Not Verified"];

function User() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [userTypeFilter, setUserTypeFilter] = useState("All User Type");
  const [verificationFilter, setVerificationFilter] = useState("All Verified");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        [user.name, user.email, user.mobileNumber, user.userId, user.userType]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "All Status" ||
        user.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesUserType =
        userTypeFilter === "All User Type" || user.userType === userTypeFilter;

      const isVerified = user.status === "ACTIVE" || user.status === "VERIFIED";
      const matchesVerification =
        verificationFilter === "All Verified" ||
        (verificationFilter === "Verified" && isVerified) ||
        (verificationFilter === "Not Verified" && !isVerified);

      return matchesSearch && matchesStatus && matchesUserType && matchesVerification;
    });
  }, [searchText, statusFilter, userTypeFilter, verificationFilter]);

  const resetFilters = () => {
    setSearchText("");
    setStatusFilter("All Status");
    setUserTypeFilter("All User Type");
    setVerificationFilter("All Verified");
    setFromDate("");
    setToDate("");
  };

  const selectClass = "h-10 rounded-lg border-border bg-background text-sm";
  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input id="user-search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search users by name, email or mobile..." className={selectClass} />
            <Select id="user-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={selectClass}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</Select>
            <Select id="user-type" value={userTypeFilter} onChange={(event) => setUserTypeFilter(event.target.value)} className={selectClass}>{userTypeOptions.map((option) => <option key={option}>{option}</option>)}</Select>
            <Select id="user-verification" value={verificationFilter} onChange={(event) => setVerificationFilter(event.target.value)} className={selectClass}>{verificationOptions.map((option) => <option key={option}>{option}</option>)}</Select>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:w-64"><label htmlFor="joined-from" className="mb-1.5 block text-xs font-medium text-muted">Joined Date</label><div className="grid grid-cols-2 gap-1"><Input id="joined-from" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-10 min-w-0 px-2 text-[10px]" /><Input id="joined-to" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-10 min-w-0 px-2 text-[10px]" /></div></div>
            <div className="flex gap-3"><Button variant="secondary" size="sm" onClick={resetFilters}>Reset</Button><Button size="sm" onClick={() => navigate("/users/add")}>+ Add User</Button></div>
          </div>
        </div>

        <div className="w-full max-w-full overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full table-fixed border-collapse text-left text-[11px] sm:text-xs">
            <colgroup><col className="w-[9%]" /><col className="w-[14%]" /><col className="w-[9%]" /><col className="w-[13%]" /><col className="w-[10%]" /><col className="w-[8%]" /><col className="w-[7%]" /><col className="w-[7%]" /><col className="w-[6%]" /><col className="w-[7%]" /><col className="w-[10%]" /></colgroup>
            <thead className="bg-primary-light text-foreground"><tr>{["ID", "User", "Mobile", "Email", "User Type", "Status", "City", "Last Active", "Total Orders", "Wallet Balance", "Actions"].map((heading) => <th key={heading} className="break-words px-1.5 py-3 font-semibold sm:px-2">{heading}</th>)}</tr></thead>
            <tbody>
              {filteredUsers.map((user) => <tr key={user.userId} className="border-t border-border">
                <td className="whitespace-nowrap px-1.5 py-3 font-medium text-foreground sm:px-2">{user.userId}</td>
                <td className="min-w-0 px-1.5 py-3 sm:px-2"><div className="flex min-w-0 items-center gap-1.5"><div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[8px] font-semibold text-white sm:h-7 sm:w-7">{user.name.split(" ").map((part) => part[0]).join("").toUpperCase()}</div><span className="truncate font-medium text-foreground">{user.name}</span></div></td>
                <td className="truncate px-1.5 py-3 text-muted sm:px-2">{user.mobileNumber}</td><td className="truncate px-1.5 py-3 text-muted sm:px-2">{user.email}</td>
                <td className="truncate px-1.5 py-3 sm:px-2"><Badge variant="info" className="h-5 max-w-full truncate rounded-sm px-1 text-[9px]">{user.userType}</Badge></td><td className="truncate px-1.5 py-3 sm:px-2"><Badge variant={statusBadgeMap[user.status] || "default"} className="h-5 max-w-full truncate rounded-sm px-1 text-[9px]">{user.status}</Badge></td>
                <td className="truncate px-1.5 py-3 text-muted sm:px-2">{user.city}</td><td className="truncate px-1.5 py-3 text-muted sm:px-2">{user.lastActive}</td><td className="truncate px-1.5 py-3 text-foreground sm:px-2">{user.totalOrders}</td><td className="truncate px-1.5 py-3 text-foreground sm:px-2">₹{user.walletBalance}</td>
                <td className="px-0.5 py-3 sm:px-2"><div className="flex items-center justify-center gap-0.5"><button type="button" aria-label={`View ${user.name}`} className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-background text-muted hover:bg-primary-light sm:h-6 sm:w-6 sm:rounded-md lg:h-8 lg:w-8"><Eye size={14} strokeWidth={2} className="lg:h-[18px] lg:w-[18px]" /></button><button type="button" aria-label={`Edit ${user.name}`} className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-background text-muted hover:bg-primary-light sm:h-6 sm:w-6 sm:rounded-md lg:h-8 lg:w-8"><Pencil size={14} strokeWidth={2} className="lg:h-[18px] lg:w-[18px]" /></button><button type="button" aria-label={`More actions for ${user.name}`} className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-background text-muted hover:bg-primary-light sm:h-6 sm:w-6 sm:rounded-md lg:h-8 lg:w-8"><MoreVertical size={14} strokeWidth={2} className="lg:h-[18px] lg:w-[18px]" /></button></div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        {!filteredUsers.length && <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">No users found for the selected search and filter.</div>}
      </div>
    </section>
  );
}

export default User;