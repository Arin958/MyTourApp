import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { format } from 'date-fns';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { useNavigate } from 'react-router-dom';

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editParticipants, setEditParticipants] = useState(1);
  const [editDate, setEditDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/booking/userBooking', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBookings(res.data);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, []);

  const getStatusSeverity = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString) => format(new Date(dateString), 'MMM dd, yyyy');

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const handleViewDetails = (tour) => {
    navigate(`/tours/${tour.slug}`);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/booking/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(bookings.filter(booking => booking.id !== bookingId));
    } catch (error) {
      console.error(error);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setEditParticipants(booking.participants);
    setEditDate(new Date(booking.date));
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking) return;
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const updatedBooking = {
        participants: editParticipants,
        date: editDate.toISOString(),
      };

      const res = await axios.patch(
        `http://localhost:3000/api/booking/${editingBooking.id}`,
        updatedBooking,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(bookings.map(booking => 
        booking.id === editingBooking.id ? res.data : booking
      ));
      
      setEditingBooking(null);
    } catch (error) {
      console.error(error);
      setError('Failed to update booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editDialogFooter = (
    <div>
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        onClick={() => setEditingBooking(null)} 
        className="p-button-text" 
      />
      <Button 
        label="Update" 
        icon="pi pi-check" 
        onClick={handleUpdateBooking} 
        loading={isSubmitting}
      />
    </div>
  );

  // ... (keep all your existing loading, error, and empty state renderings)
  if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <ProgressSpinner 
              strokeWidth="4" 
              animationDuration=".5s" 
              className="w-12 h-12"
            />
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="p-6 rounded-lg bg-red-50 border border-red-100 max-w-md text-center">
            <div className="flex items-center justify-center text-red-600 mb-3">
              <i className="pi pi-exclamation-triangle text-2xl mr-2"></i>
              <h3 className="text-lg font-medium">Error Loading Bookings</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <Button 
              label="Try Again" 
              icon="pi pi-refresh" 
              className="p-button-sm bg-red-600 border-red-600 hover:bg-red-700" 
              onClick={() => window.location.reload()}
            />
          </div>
        </div>
      );
    }
  
    if (bookings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="text-center p-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 max-w-lg w-full shadow-sm border border-gray-100">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <i className="pi pi-calendar text-3xl text-blue-500"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Yet</h2>
            <p className="text-gray-600 mb-6">You haven't booked any tours yet. Discover amazing destinations and start your next adventure!</p>
            <Button 
              label="Explore Tours" 
              icon="pi pi-arrow-right" 
              iconPos="right" 
              className="bg-blue-600 border-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/tours')}
            />
          </div>
        </div>
      );
    }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... (keep your existing header code) */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your upcoming and past adventures</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium flex items-center">
            <i className="pi pi-bookmark mr-2"></i>
            {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
          </div>
        </div>
      </div>

      <Divider className="my-2" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <div key={booking.id} className="group">
            <Card className="h-full border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-200">
              {/* ... (keep your existing card content) */}

              {/* Card footer - Modified to include Edit button */}
              <div className="px-5 pb-5">
                <div className="flex justify-between space-x-3">
                  <Button 
                    label="Details" 
                    icon="pi pi-eye" 
                    className="p-button-text p-button-sm text-blue-600 hover:bg-blue-50" 
                    onClick={() => handleViewDetails(booking.Tour)}
                  />
                  <div className="flex space-x-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button 
                          label="Edit" 
                          icon="pi pi-pencil" 
                          className="p-button-outlined p-button-sm p-button-secondary border-gray-500 text-gray-600 hover:bg-gray-50" 
                          onClick={() => handleEditBooking(booking)}
                        />
                        <Button 
                          label="Cancel" 
                          icon="pi pi-times" 
                          className="p-button-outlined p-button-sm p-button-danger border-red-500 text-red-600 hover:bg-red-50" 
                          onClick={() => handleCancelBooking(booking.id)}
                        />
                      </>
                    )}
                    {booking.status === 'paid' && (
                      <Button 
                        label="Invoice" 
                        icon="pi pi-download" 
                        className="p-button-outlined p-button-sm p-button-help border-purple-500 text-purple-600 hover:bg-purple-50" 
                      />
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Edit Booking Dialog */}
      <Dialog 
        visible={!!editingBooking} 
        style={{ width: '32rem' }} 
        breakpoints={{ '960px': '75vw', '641px': '90vw' }} 
        header="Edit Booking" 
        modal 
        className="p-fluid" 
        footer={editDialogFooter} 
        onHide={() => setEditingBooking(null)}
      >
        {editingBooking && (
          <div className="space-y-4">
            <div>
              <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Participants
              </label>
              <InputNumber
                id="participants"
                value={editParticipants}
                onValueChange={(e) => setEditParticipants(e.value)}
                mode="decimal"
                showButtons
                min={1}
                max={editingBooking.Tour.maxGroupSize}
                className="w-full"
              />
              <small className="text-gray-500">
                Max group size: {editingBooking.Tour.maxGroupSize}
              </small>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Tour Date
              </label>
              <Calendar
                id="date"
                value={editDate}
                onChange={(e) => setEditDate(e.value)}
                dateFormat="yy-mm-dd"
                minDate={new Date()}
                className="w-full"
                showIcon
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-3 mt-4">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">
                Current Total Price
              </p>
              <p className="text-xl font-bold text-blue-700">
                {formatCurrency(editingBooking.price)}
              </p>
              <small className="text-gray-500">
                Price may change based on participant count
              </small>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default BookingPage;