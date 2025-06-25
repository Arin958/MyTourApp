import { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";
import { AuthContext } from "../../../Context/AuthContext";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
];

// Updated status severity colors
const statusSeverity = {
  pending: "warning",
  paid: "success",
  cancelled: "danger",
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);
  const toast = useRef(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API}/api/booking/allBookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.bookings);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      toast.current.show({ severity: "error", summary: "Error", detail: "Failed to fetch bookings" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);





  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await axios.patch(
        `${API}/api/booking/admin/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: newStatus } : booking
        )
      );

      toast.current.show({
        severity: "success",
        summary: "Updated",
        detail: `Status set to ${newStatus}`,
      });
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.response?.data?.message || "Failed to update status",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: "Are you sure you want to delete this booking?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        setDeletingId(id);
        try {
          await axios.delete(`${API}/api/booking/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBookings((prev) => prev.filter((booking) => booking.id !== id));
          toast.current.show({ severity: "success", summary: "Deleted", detail: "Booking deleted" });
        } catch {
          toast.current.show({ severity: "error", summary: "Error", detail: "Failed to delete booking" });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const statusBodyTemplate = (rowData) => (
    <Tag value={rowData.status} severity={statusSeverity[rowData.status]} />
  );

const actionBodyTemplate = (rowData) => (
  <div className="flex gap-2 flex-wrap">
    <Dropdown
      value={rowData.status}
      options={statusOptions}
      onChange={(e) => handleUpdateStatus(rowData.id, e.value)}
      disabled={updatingId === rowData.id}
      placeholder="Update status"
      className="p-dropdown-sm"
    />

    {rowData.cancellationRequested && (
      <>
        <Button
          label="Approve"
          icon="pi pi-check"
          className="p-button-success p-button-sm"
          onClick={() => handleCancellation(rowData.id, "approve")}
        />
        <Button
          label="Reject"
          icon="pi pi-times"
          className="p-button-warning p-button-sm"
          onClick={() => handleCancellation(rowData.id, "reject")}
        />
      </>
    )}

    <Button
      icon="pi pi-trash"
      className="p-button-danger p-button-sm"
      onClick={() => handleDelete(rowData.id)}
      loading={deletingId === rowData.id}
    />
  </div>
);

const handleCancellation = async (id, action) => {
  try {
    const res = await axios.patch(
      `${API}/api/booking/handle-cancel/${id}n`,
      { action },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Update UI after response
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              status: action === "approve" ? "cancelled" : booking.status,
              cancellationRequested: false,
            }
          : booking
      )
    );

    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: res.data.message,
    });
  } catch (err) {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: err.response?.data?.message || "Failed to handle cancellation",
    });
  }
};



  return (
    <div className="p-5 max-w-7xl mx-auto">
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">All Bookings</h2>
        <Button label="Refresh" icon="pi pi-refresh" onClick={fetchBookings} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No bookings found</div>
      ) : (
        <DataTable value={bookings} paginator rows={10} className="p-datatable-sm">
          <Column field="Tour.title" header="Tour" body={(row) => row.Tour?.title || "N/A"} />
          <Column
            field="User.name"
            header="User"
            body={(row) => (
              <>
                {row.User?.name || "Guest"} <br />
                <small className="text-gray-400">{row.User?.email}</small>
              </>
            )}
          />
          <Column
            field="date"
            header="Date"
            body={(row) => format(new Date(row.date), "MMM dd, yyyy")}
          />
          <Column field="participants" header="Participants" className="text-right" />
          <Column
            field="price"
            header="Price"
            body={(row) => `$${row.price}`}
            className="text-right"
          />
          <Column field="status" header="Status" body={statusBodyTemplate} />
          <Column header="Actions" body={actionBodyTemplate} className="text-right" />
          <Column
  header="Cancellation"
  body={(row) =>
    row.cancellationRequested ? (
      <Tag value="Requested" severity="warning" />
    ) : (
      "-"
    )
  }
/>

        </DataTable>
      )}
    </div>
  );
}
