import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Rating } from 'primereact/rating';
import { Card } from 'primereact/card';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Image } from 'primereact/image';
import { ProgressSpinner } from 'primereact/progressspinner';

const base_url = "http://localhost:3000";

const AdminTour = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTour, setSelectedTour] = useState(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const toast = React.useRef(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = () => {
    axios.get(`${base_url}/api/tours`)
      .then(response => {
        setTours(response.data.tours);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
        showError('Failed to load tours');
      });
  };

  const showError = (message) => {
    toast.current.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000
    });
  };

  const imageBodyTemplate = (rowData) => {
    return (
      <Image 
        src={`${base_url}/img/tours/${rowData.coverImage}`} 
        alt={rowData.title} 
        width="80" 
        preview 
        className="shadow-2 border-round"
      />
    );
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag 
        value={rowData.isActive ? 'Active' : 'Inactive'} 
        severity={rowData.isActive ? 'success' : 'danger'} 
      />
    );
  };

  const ratingBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <Rating value={rowData.ratingsAverage} readOnly cancel={false} />
        <span>({rowData.ratingsQuantity})</span>
      </div>
    );
  };

  const priceBodyTemplate = (rowData) => {
    return (
      <div>
        <span className="font-bold">${rowData.price}</span>
        {rowData.priceDiscount && (
          <span className="ml-2 text-sm line-through text-500">${parseFloat(rowData.price) + parseFloat(rowData.priceDiscount)}</span>
        )}
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button 
          icon="pi pi-eye" 
          className="p-button-rounded p-button-info p-button-text" 
          tooltip="View Details"
          onClick={() => {
            setSelectedTour(rowData);
            setDisplayDialog(true);
          }}
        />
        <Button 
          icon="pi pi-pencil" 
          className="p-button-rounded p-button-warning p-button-text" 
          tooltip="Edit"
        />
        <Button 
          icon="pi pi-trash" 
          className="p-button-rounded p-button-danger p-button-text" 
          tooltip="Delete"
        />
      </div>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex gap-2">
        <Button label="New Tour" icon="pi pi-plus" className="p-button-success" />
        <Button label="Export" icon="pi pi-upload" className="p-button-help" />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText 
          type="search" 
          placeholder="Search tours..." 
          onInput={(e) => setGlobalFilter(e.target.value)}
        />
      </span>
    );
  };

  if (loading) return (
    <div className="flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <ProgressSpinner />
    </div>
  );

  if (error) return (
    <div className="flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <Card className="text-center">
        <i className="pi pi-exclamation-triangle text-5xl text-red-500 mb-3" />
        <h2>Error Loading Tours</h2>
        <p>{error}</p>
        <Button 
          label="Retry" 
          icon="pi pi-refresh" 
          className="p-button-text" 
          onClick={fetchTours}
        />
      </Card>
    </div>
  );

  return (
    <div className="grid">
      <Toast ref={toast} />
      
      <div className="col-12">
        <Card>
          <Toolbar left={leftToolbarTemplate} right={rightToolbarTemplate} />
          
          <DataTable
            value={tours}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tours"
            globalFilter={globalFilter}
            emptyMessage="No tours found."
            loading={loading}
            className="p-datatable-sm"
          >
            <Column field="title" header="Title" sortable />
            <Column header="Image" body={imageBodyTemplate} style={{ width: '100px' }} />
            <Column field="duration" header="Days" sortable style={{ width: '100px' }} />
            <Column field="maxGroupSize" header="Group Size" sortable style={{ width: '120px' }} />
            <Column header="Price" body={priceBodyTemplate} sortable style={{ width: '150px' }} />
            <Column header="Rating" body={ratingBodyTemplate} sortable style={{ width: '180px' }} />
            <Column header="Status" body={statusBodyTemplate} sortable style={{ width: '120px' }} />
            <Column body={actionBodyTemplate} style={{ width: '180px' }} />
          </DataTable>
        </Card>
      </div>

      <Dialog
        header="Tour Details"
        visible={displayDialog}
        style={{ width: '50vw' }}
        onHide={() => setDisplayDialog(false)}
      >
        {selectedTour && (
          <div className="grid">
            <div className="col-12 md:col-4">
              <Image 
                src={`${base_url}/img/tours/${selectedTour.coverImage}`} 
                alt={selectedTour.title}
                width="100%"
                preview
                className="shadow-2 border-round"
              />
            </div>
            <div className="col-12 md:col-8">
              <h2>{selectedTour.title}</h2>
              <p className="text-500 mt-0">{selectedTour.summary}</p>
              
              <div className="grid mt-3">
                <div className="col-6">
                  <p><strong>Duration:</strong> {selectedTour.duration} days</p>
                  <p><strong>Group Size:</strong> Up to {selectedTour.maxGroupSize} people</p>
                  <p><strong>Difficulty:</strong> {selectedTour.difficulty || 'Not specified'}</p>
                </div>
                <div className="col-6">
                  <p><strong>Price:</strong> ${selectedTour.price}</p>
                  {selectedTour.priceDiscount && (
                    <p><strong>Discount:</strong> ${selectedTour.priceDiscount}</p>
                  )}
                  <p><strong>Rating:</strong> {selectedTour.ratingsAverage} ({selectedTour.ratingsQuantity} reviews)</p>
                </div>
              </div>
              
              <div className="mt-3">
                <h4>Description</h4>
                <p>{selectedTour.description}</p>
              </div>
              
              <div className="mt-3">
                <h4>Start Dates</h4>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(selectedTour.startDates).map((date, index) => (
                    <Tag key={index} value={new Date(date).toLocaleDateString()} className="mr-2" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default AdminTour;