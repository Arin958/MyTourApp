import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { getProfile } from "../../services/authServices";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const BookingForm = () => {
  const { slug } = useParams();
  const [user, setUser] = useState(null);
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(null);
  const [participants, setParticipants] = useState(1);
  const toast = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getProfile();
        console.log(res.data.user, "users");
        setUser(res.data.user);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    const source = axios.CancelToken.source();

    axios
      .get(`${API}/api/tours/${slug}`, { cancelToken: source.token })
      .then((res) => {
        console.log(res.data);
        setTour(res.data.tour);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          console.error("Failed to load tour:", err);
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to load tour details",
          });
        }
      })
      .finally(() => setLoading(false));

    return () => source.cancel("Component unmounted");
  }, [slug]);

  const handleBookNow = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.current?.show({
        severity: "warn",
        summary: "Not Logged In",
        detail: "Please log in to book a tour",
      });
      return;
    }

    if (!user || !user.id) {
      toast.current?.show({
        severity: "warn",
        summary: "User not loaded",
        detail: "Please wait, user data is still loading",
      });
      return;
    }
    
    if (!tour) return;

    if (!date) {
      toast.current?.show({
        severity: "warn",
        summary: "Select Date",
        detail: "Please select a tour date",
      });
      return;
    }

    if (participants > tour.maxGroupSize) {
      toast.current?.show({
        severity: "warn",
        summary: "Group Size Exceeded",
        detail: `Maximum group size is ${tour.maxGroupSize}`,
      });
      return;
    }

    try {
      const res = await axios.post(`${API}/api/booking`, {
        tourId: tour.id,
        userId: user.id,
        price: tour.price * participants, // Total price calculation
        date,
        participants,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      toast.current?.show({
        severity: "success",
        summary: "Booking Successful",
        detail: `Booked ${tour.title} for ${participants} participant(s) on ${date.toLocaleDateString()}`,
      });
    } catch (error) {
      console.log(error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to book tour",
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!tour) return <div>Tour not found</div>;

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-lg sticky top-8 overflow-hidden border border-gray-200">
      <Toast ref={toast} />
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Book This Tour
          </h3>

          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-600">Price per person</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-emerald-600">
                ${tour.price}
              </span>
              {tour.priceDiscount && (
                <span className="block text-sm text-gray-500 line-through">
                  ${tour.priceDiscount}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <Calendar
                value={date}
                onChange={(e) => setDate(e.value)}
                minDate={new Date()}
                placeholder="Choose tour date"
                className="w-full"
                showIcon
                dateFormat="dd/mm/yy"
                inputClassName="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Participants
              </label>
              <InputNumber
                value={participants}
                onValueChange={(e) => setParticipants(e.value)}
                mode="decimal"
                showButtons
                min={1}
                max={tour.maxGroupSize}
                className="w-full"
                inputClassName="w-full"
              />
              <small className="text-gray-500">
                Maximum {tour.maxGroupSize} participants
              </small>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between font-medium">
                <span>Total Price:</span>
                <span className="text-emerald-600">
                  ${(tour.price * participants).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Button
            label="Book Now"
            icon="pi pi-check"
            className="w-full p-button-lg p-button-success"
            onClick={handleBookNow}
          />
          <Button
            label="Add to Wishlist"
            icon="pi pi-heart"
            className="w-full p-button-lg p-button-outlined mt-3"
          />
        </div>

        <div className="bg-gray-50 p-6 border-t">
          <h4 className="font-bold text-gray-800 mb-4">Quick Facts</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                <i className="pi pi-clock text-lg"></i>
              </div>
              <div>
                <h5 className="font-medium text-gray-700">Duration</h5>
                <p className="text-gray-600">{tour.duration} days</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <i className="pi pi-users text-lg"></i>
              </div>
              <div>
                <h5 className="font-medium text-gray-700">Group Size</h5>
                <p className="text-gray-600">Max {tour.maxGroupSize} people</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                <i className="pi pi-compass text-lg"></i>
              </div>
              <div>
                <h5 className="font-medium text-gray-700">Difficulty</h5>
                <p className="text-gray-600 capitalize">
                  {tour.difficulty} level
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;