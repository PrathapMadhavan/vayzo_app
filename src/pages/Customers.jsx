import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RotateCcw, Eye, Pencil as Edit, Trash2, Check, X, MoreVertical, Download } from "lucide-react";
import Avatar from "../components/ui/Avatar";

import Badge from "../components/ui/Badge";
import BadgeCell from "../components/ui/BadgeCell";
import Button from "../components/ui/Button";
import SearchInput from "../components/ui/SearchInput";
import StatusSelect from "../components/ui/StatusSelect";
import DateRangeInput from "../components/ui/DateRangeInput";
import Table from "../components/ui/Table";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import FilterPanel from "../components/ui/FilterPanel";

import ActionMenu from "../components/ui/ActionMenu";

import { getCustomers, deleteCustomer } from "../api/usersApi";
import { exportToCSV } from "../utils/exportUtils";

const statusBadgeMap = {
  Active: "success",
  Verified: "info",
  Pending: "warning",
  Blocked: "danger",
  Inactive: "danger",
};

const statusOptions = [
  "All Status",
  "Active",
  "Verified",
  "Pending",
  "Blocked",
];

const verificationOptions = ["All Verified", "Verified", "Not Verified"];

const customerTableHeaders = [
  "No.",
  "ID",
  "Customer",
  "Mobile",
  "Email",
  "Status",
  "Verified",
  "Joined On",
  "Actions",
];

function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteModalId, setDeleteModalId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [verificationFilter, setVerificationFilter] = useState("All Verified");
  const [joinedFrom, setJoinedFrom] = useState("");
  const [joinedTo, setJoinedTo] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCustomers();

        if (isMounted) {
          setCustomers(data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load customers.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return customers.filter((customer) => {
      const isVerified = customer.isVerified === true;
      const matchesSearch =
        !query ||
        [customer.name, customer.email, customer.mobileNumber, customer.public_id, customer.id]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All Status" ||
        customer.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesVerification =
        verificationFilter === "All Verified" ||
        (verificationFilter === "Verified" && isVerified) ||
        (verificationFilter === "Not Verified" && !isVerified);

      const matchesJoinedDate =
        (!joinedFrom || customer.joinedOn >= joinedFrom) &&
        (!joinedTo || customer.joinedOn <= joinedTo);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesVerification &&
        matchesJoinedDate
      );
    });
  }, [
    searchText,
    customers,
    statusFilter,
    verificationFilter,
    joinedFrom,
    joinedTo,
  ]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toTitleCase = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const maxStatus = useMemo(() => {
    return paginatedCustomers.reduce((max, u) => {
      const statusStr = toTitleCase(u.status || "");
      return statusStr.length > max.length ? statusStr : max;
    }, "");
  }, [paginatedCustomers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter, verificationFilter, joinedFrom, joinedTo]);

  const hasFilters =
    searchText !== "" ||
    statusFilter !== "All Status" ||
    verificationFilter !== "All Verified" ||
    joinedFrom !== "" ||
    joinedTo !== "";

  const resetFilters = () => {
    setSearchText("");
    setStatusFilter("All Status");
    setVerificationFilter("All Verified");
    setJoinedFrom("");
    setJoinedTo("");
  };

  const handleDeleteCustomer = async () => {
    if (!deleteModalId) return;
    try {
      await deleteCustomer(deleteModalId);
      setCustomers((prev) => prev.filter((u) => u.customerId !== deleteModalId));
      setDeleteModalId(null);
      // Pagination handled automatically by recalculated totalPages,
      // but let's ensure we don't end up on an empty page if possible
      const newFilteredLength = filteredCustomers.length - 1;
      const newTotalPages = Math.ceil(newFilteredLength / itemsPerPage) || 1;
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer.");
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 flex flex-col gap-6">
      <Card noPadding className="flex flex-col">
        {/* Filter Section */}
        <FilterPanel
          search={
            <SearchInput
              id="customer-search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search customers by ID, name, email or mobile..."
            />
          }
          actions={
            <>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                className="h-10 flex-1 sm:flex-none sm:w-auto flex items-center justify-center text-sm"
                onClick={() => exportToCSV(filteredCustomers, "customers.csv")}
              >
                <Download size={14} className="mr-1 hidden sm:inline" /> Export
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/customers/add")}
                className="h-10 flex-1 sm:flex-none sm:w-auto flex items-center justify-center gap-1.5 text-sm"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Add Customer</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </>
          }
          filters={
            <>
              <StatusSelect
                id="customer-status"
                value={statusFilter}
                options={statusOptions}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full lg:w-[150px]"
              />
              <StatusSelect
                id="customer-verification"
                value={verificationFilter}
                options={verificationOptions}
                onChange={(event) => setVerificationFilter(event.target.value)}
                className="w-full lg:w-[150px]"
              />
              <DateRangeInput
                id="joined-date"
                label="Joined Date"
                fromValue={joinedFrom}
                toValue={joinedTo}
                onFromChange={(event) => setJoinedFrom(event.target.value)}
                onToChange={(event) => setJoinedTo(event.target.value)}
              />
            </>
          }
          hasActiveFilters={hasFilters}
          onReset={resetFilters}
        />
      </Card>

      <Card noPadding className="flex flex-col">
        {/* Table Section */}
        {error ? (
          <div className="m-6 rounded-xl border border-danger/30 bg-danger/5 p-8 text-center text-sm font-medium text-danger">
            {error}
          </div>
        ) : (
          <Table
            headers={customerTableHeaders}
            currentCount={paginatedCustomers.length}
            totalCount={filteredCustomers.length}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            minWidth="1000px"
            className="border-0 shadow-none rounded-none border-t border-border"
          >
            {loading ? (
              <tr>
                <td
                  colSpan={customerTableHeaders.length}
                  className="p-10 text-center text-sm text-muted"
                >
                  Loading customers...
                </td>
              </tr>
            ) : paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer, index) => (
                <tr
                  key={customer.public_id}
                  onClick={() => navigate(`/customers/${customer.public_id}`)}
                  className="border-b border-border last:border-0 transition-colors hover:bg-muted/30 cursor-pointer"
                >
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">
                    {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">
                    <div className="max-w-[100px] sm:max-w-[150px] truncate" title={customer.public_id}>
                      {customer.public_id}
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar 
                        src={customer.profileImage || customer.image} 
                        alt={customer.name} 
                        identifier={customer.public_id} 
                        className="h-8 w-8 rounded-full shadow-sm"
                      />

                      <span className="truncate font-medium text-foreground">
                        {customer.name}
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-muted">
                    {customer.mobileNumber}
                  </td>

                  <td className="truncate px-3 py-3 text-muted">
                    {customer.email}
                  </td>

                  <td className="px-3 py-3">
                    <BadgeCell
                      maxContent={maxStatus}
                      content={toTitleCase(customer.status)}
                      variant={statusBadgeMap[toTitleCase(customer.status)] || "default"}
                      className="px-3"
                    />
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={[
                        "flex h-6 w-6 items-center justify-center rounded-full",
                        customer.isVerified
                          ? "bg-success/15 text-success"
                          : "bg-danger/15 text-danger",
                      ].join(" ")}
                    >
                      {customer.isVerified ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-muted">
                    {customer.joinedOn}
                  </td>

                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <ActionMenu
                        actions={[
                          {
                            label: "View",
                            icon: Eye,
                            onClick: () => navigate(`/customers/${customer.public_id}`),
                          },
                          {
                            label: "Edit",
                            icon: Edit,
                            onClick: () => navigate(`/customers/edit/${customer.public_id}`),
                          },
                          {
                            label: "Delete",
                            icon: Trash2,
                            danger: true,
                            onClick: () => setDeleteModalId(customer.public_id),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={customerTableHeaders.length}
                  className="p-10 text-center text-sm text-muted"
                >
                  No customers found for the selected search and filters.
                </td>
              </tr>
            )}
          </Table>
        )}
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deleteModalId} 
        onClose={() => setDeleteModalId(null)} 
        title="Delete Customer"
      >
        <p className="text-sm text-muted">Are you sure you want to delete this customer? This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalId(null)}>Cancel</Button>
          <Button className="bg-danger hover:bg-danger/90 text-white" onClick={handleDeleteCustomer}>Delete</Button>
        </div>
      </Modal>
    </section>
  );
}

export default Customers;
