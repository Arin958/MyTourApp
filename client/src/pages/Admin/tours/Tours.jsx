import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Toolbar,
  Button,
  DataTable,
  Column,
  ConfirmDialog,
  confirmDialog,
  Toast,
  Tag,
  Card,
  ProgressSpinner,
  InputText,
  Dialog,
  InputTextarea,
  Dropdown,
  FileUpload
} from "primereact";
import { InputSwitch } from "primereact/inputswitch";
import { deleteTour, getAdminTours } from "../../../services/tourService";
import axios from "axios";

export default function Tours() {
  const API = "http://localhost:3000";
  const navigate = useNavigate();
  const toast = useRef(null);
  const deleteIdRef = useRef(null);

  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = tours.filter(tour => {
        const searchLower = searchTerm.toLowerCase();
        return (
          tour.title.toLowerCase().includes(searchLower) ||
          (tour.description && tour.description.toLowerCase().includes(searchLower)) ||
          tour.difficulty.toLowerCase().includes(searchLower) ||
          tour.price.toString().includes(searchTerm) ||
          tour.id.toString().includes(searchTerm) ||
          (tour.summary && tour.summary.toLowerCase().includes(searchLower))
        );
      });
      setFilteredTours(filtered);
    } else {
      setFilteredTours(tours);
    }
  }, [searchTerm, tours]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await getAdminTours();
      setTours(response.data.tours);
      setFilteredTours(response.data.tours);
    } catch (error) {
      showToast('error', 'Error', 'Failed to load tours');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTour = async (id) => {
    try {
      await deleteTour(id);
      showToast('success', 'Success', 'Tour deleted successfully');
      fetchTours();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Failed to delete tour');
    }
  };

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const confirmDelete = (id) => {
    deleteIdRef.current = id;
    confirmDialog({
      message: "Are you sure you want to delete this tour? This action cannot be undone.",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDeleteTour(deleteIdRef.current),
      reject: () => {
        showToast('warn', 'Cancelled', 'Tour deletion cancelled');
      },
    });
  };

 
const handleEditSubmit = async () => {
  try {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      // Ensure boolean fields like isActive are appended as strings
      data.append(key, typeof value === "boolean" ? value.toString() : value);
    });

    if (selectedFile) {
      data.append("file", selectedFile);
    }

    const response = await axios.put(
      `${API}/api/tours/${selectedTour.id}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    showToast("success", "Success", "Tour updated successfully");
    setEditDialogVisible(false);
    setSelectedFile(null);
    fetchTours();
  } catch (err) {
    console.error(err);
    showToast(
      "error",
      "Error",
      err.response?.data?.message || "Failed to update tour"
    );
  }
};

  const leftToolbarTemplate = () => (
    <div className="flex align-items-center gap-3">
      <i className="pi pi-map text-2xl" style={{ color: 'var(--primary-color)' }} />
      <h2 className="m-0 text-2xl font-semibold">Tour Management</h2>
    </div>
  );

  const rightToolbarTemplate = () => (
    <div className="flex gap-2">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tours..."
        />
      </span>
      <Button
        label="Create Tour"
        icon="pi pi-plus"
        className="p-button-success"
        onClick={() => navigate('/admin/tours/create')}
      />
    </div>
  );

  const imageBodyTemplate = (tour) => (
    <img
      src={`${API}/uploads/${tour.coverImage}`}
      alt={tour.title}
      className="w-20 h-20 object-cover rounded-lg shadow-md"
      onError={(e) => {
        e.target.src = 'https://placehold.co/200?text=No+Image';
        e.target.onerror = null;
      }}
    />
  );

  const statusBodyTemplate = (tour) => (
    <Tag
      value={tour.isActive ? 'Active' : 'Inactive'}
      severity={tour.isActive ? 'success' : 'danger'}
      icon={tour.isActive ? 'pi pi-check-circle' : 'pi pi-times-circle'}
      rounded
    />
  );

  const priceBodyTemplate = (tour) => (
    <div className="flex flex-column">
      <span className="font-bold">${tour.price}</span>
      {tour.priceDiscount && (
        <span className="text-sm line-through text-500">${tour.priceDiscount}</span>
      )}
    </div>
  );

  const difficultyBodyTemplate = (tour) => {
    const severityMap = {
      easy: 'success',
      medium: 'warning',
      difficult: 'danger'
    };

    return (
      <Tag
        value={tour.difficulty}
        severity={severityMap[tour.difficulty] || 'info'}
        rounded
      />
    );
  };

  const actionBodyTemplate = (tour) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-info p-button-outlined"
        tooltip="View Details"
        tooltipOptions={{ position: 'top' }}
        onClick={() => navigate(`/admin/tours/${tour.id}`)}
      />
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-warning p-button-outlined"
        tooltip="Edit"
        tooltipOptions={{ position: 'top' }}
        onClick={() => {
          setSelectedTour(tour);
          setFormData({ ...tour });
          setEditDialogVisible(true);
        }}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-outlined"
        tooltip="Delete"
        tooltipOptions={{ position: 'top' }}
        onClick={() => confirmDelete(tour.id)}
      />
    </div>
  );

  const emptyMessageTemplate = () => (
    <div className="flex flex-column align-items-center justify-content-center p-4">
      <i className="pi pi-search text-5xl text-400 mb-2" />
      <span className="text-600">
        {searchTerm ? 'No matching tours found' : 'No tours available'}
      </span>
      {searchTerm && (
        <Button 
          label="Clear search" 
          className="p-button-text mt-2" 
          onClick={() => setSearchTerm('')} 
        />
      )}
    </div>
  );

  return (
    <Card className="shadow-2 border-round">
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog />

      <Toolbar
        className="mb-4 border-none bg-white"
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
      />

      {loading ? (
        <div className="flex justify-content-center p-8">
          <ProgressSpinner />
        </div>
      ) : (
        <DataTable
          value={filteredTours}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tours"
          emptyMessage={emptyMessageTemplate()}
          stripedRows
          removableSort
          className="shadow-1 border-round"
        >
          <Column field="id" header="ID" sortable style={{ width: '5%' }} />
          <Column field="title" header="Title" sortable style={{ width: '20%' }} />
          <Column header="Image" body={imageBodyTemplate} style={{ width: '10%' }} />
          <Column field="duration" header="Duration (days)" sortable style={{ width: '8%' }} />
          <Column field="maxGroupSize" header="Max Group" sortable style={{ width: '8%' }} />
          <Column header="Price" body={priceBodyTemplate} sortable sortField="price" style={{ width: '10%' }} />
          <Column header="Difficulty" body={difficultyBodyTemplate} sortable sortField="difficulty" style={{ width: '10%' }} />
          <Column header="Status" body={statusBodyTemplate} sortable sortField="isActive" style={{ width: '10%' }} />
          <Column header="Actions" body={actionBodyTemplate} style={{ width: '15%' }} />
        </DataTable>
      )}

      {/* Edit Dialog */}
      <Dialog
        header="Edit Tour"
        visible={editDialogVisible}
        style={{ width: '600px' }}
        modal
        className="p-fluid"
        onHide={() => setEditDialogVisible(false)}
      >
        <div className="field">
          <label htmlFor="title">Title</label>
          <InputText
            id="title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            rows={3}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="price">Price</label>
          <InputText
            id="price"
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="difficulty">Difficulty</label>
          <Dropdown
            id="difficulty"
            value={formData.difficulty || ''}
            options={['easy', 'medium', 'difficult']}
            onChange={(e) => setFormData({ ...formData, difficulty: e.value })}
            placeholder="Select difficulty"
          />
        </div>

        <div className="field">
          <label htmlFor="file">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          {selectedFile && (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="mt-3 w-32 h-32 object-cover border-round shadow-1"
            />
          )}
        </div>

        <div className="field">
  <label htmlFor="isActive">Active</label>
  <InputSwitch
    id="isActive"
    checked={formData.isActive}
    onChange={(e) => setFormData({ ...formData, isActive: e.value })}
  />
</div>


        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => setEditDialogVisible(false)}
          />
          <Button
            label="Save"
            icon="pi pi-check"
            onClick={handleEditSubmit}
          />
        </div>
      </Dialog>
    </Card>
  );
}
