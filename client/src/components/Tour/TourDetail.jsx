import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { Rating } from "primereact/rating";
import { Divider } from "primereact/divider";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { Avatar } from "primereact/avatar";
import { 
   
  MapPin, 
  Clock, 
 
  BadgePercent, 
  CheckCircle2, 
  Info, 
  Star, 
  PenLine, 
  Check, 
  X, 
  Trash2
} from 'lucide-react';
import { getProfile } from "../../services/authServices";
import BookingForm from "./BookingForm";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const FALLBACK_IMAGE = "https://picsum.photos/id/1018/1920/1080";
const DIFFICULTY_COLORS = {
  easy: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  difficult: "bg-red-100 text-red-800 border-red-300",
};

export default function TourDetails() {
  const { slug } = useParams();
  const [data, setData] = useState({ tour: null, reviews: [] });
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [reviewForm, setReviewForm] = useState({ rating: 0, review: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const toast = useRef(null);

  const [authUser, setAuthUser] = useState(null);

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await getProfile();
      
      setAuthUser(res.data.user); 
      // adjust based on your API response structure
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  fetchUser();
}, []);




  useEffect(() => {
    const source = axios.CancelToken.source();
    
    axios
      .get(`${API}/api/tours/${slug}`, { cancelToken: source.token })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (!axios.isCancel(err)) {
          console.error("Failed to load tour:", err);
          showToast("error", "Error", "Failed to load tour details");
        }
      })
      .finally(() => setLoading(false));

    return () => source.cancel("Component unmounted");
  }, [slug]);

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const handleBookNow = () => {
    if (!date) {
      showToast("warn", "Select Date", "Please select a tour date");
      return;
    }
    showToast("success", "Booking Started", `Booking ${data.tour.title} for ${date.toLocaleDateString()}`);
  };

const handleReviewSubmit = async (e) => {
  e.preventDefault();

  if (!reviewForm.rating) {
    showToast("warn", "Rating Required", "Please select a rating");
    return;
  }

  const token = localStorage.getItem('token'); // or whatever key you used
  if (!token) {
    showToast("error", "Unauthorized", "Please login to submit a review");
    return;
  }

  try {
    const response = await fetch(`${API}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
       
      },
      body: JSON.stringify({
        review: reviewForm.review,
        rating: reviewForm.rating,
        tourId: data.tour.id
      }),
    });

    const resData = await response.json();

    if (!response.ok) {
      showToast("error", "Failed", resData.message || "Something went wrong");
      return;
    }

    // Add new review to state
    setData(prev => ({
      ...prev,
      reviews: [resData.review, ...prev.reviews]
    }));

    // Update ratings average
    if (data.tour.ratingsAverage) {
      const newAvg = ((data.tour.ratingsAverage * data.tour.ratingsQuantity) + reviewForm.rating) /
                     (data.tour.ratingsQuantity + 1);
      setData(prev => ({
        ...prev,
        tour: {
          ...prev.tour,
          ratingsAverage: newAvg,
          ratingsQuantity: prev.tour.ratingsQuantity + 1
        }
      }));
    }

    setReviewForm({ rating: 0, review: "" });
    setShowReviewForm(false);
    showToast("success", "Review Submitted", "Thank you for your review!");
  } catch (err) {
    console.error(err);
    showToast("error", "Error", "Failed to submit review");
  }
};

const handleDeleteReview = async (reviewId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API}/api/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` }
    
    });
   setData((prev) => ({
  ...prev,
  reviews: prev.reviews.filter((r) => r.id !== reviewId),
}));
    toast.current.show({ severity: "success", summary: "Review Deleted", life: 3000 });
  } catch (err) {
    console.error(err);
    toast.current.show({ severity: "error", summary: "Error", detail: "Failed to delete review", life: 3000 });
  }
};






  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton width="100%" height="400px" className="rounded-xl" />
          <div className="space-y-4">
            <Skeleton width="60%" height="2rem" />
            <Skeleton width="100%" height="1rem" />
            <Skeleton width="100%" height="1rem" />
            <Skeleton width="100%" height="1rem" />
            <Skeleton width="30%" height="1rem" className="mt-6" />
            <Skeleton width="100%" height="200px" className="mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!data.tour) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <i className="pi pi-exclamation-circle text-5xl text-red-500 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tour Not Found</h2>
        <p className="text-gray-600 mb-6">The tour you're looking for doesn't exist or may have been removed.</p>
        <Button label="Browse Other Tours" icon="pi pi-arrow-left" className="p-button-outlined" onClick={() => window.history.back()} />
      </div>
    );
  }

  const { tour, reviews } = data;

  return (
    <>
      <Toast ref={toast} />
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={`${API}/uploads/${tour.coverImage}`}
              alt={tour.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = FALLBACK_IMAGE;
                e.target.onerror = null;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent"></div>
          </div>
          
          <div className="relative z-10 container mx-auto h-full flex flex-col justify-end pb-16 px-4 text-white">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <Tag 
                  value={tour.difficulty} 
                  className={`${DIFFICULTY_COLORS[tour.difficulty.toLowerCase()] || "bg-gray-100 text-gray-800"} border rounded-full px-3 py-1 text-sm font-medium`}
                />
                <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                  {tour.duration} days
                </span>
                {tour.ratingsAverage && (
                  <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm flex items-center gap-1">
                    <Rating value={tour.ratingsAverage} readOnly stars={1} cancel={false} className="text-amber-400 text-sm" />
                    {tour.ratingsAverage.toFixed(1)} ({tour.ratingsQuantity})
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3">
                {tour.title}
              </h1>
              
              <div className="flex items-center gap-2 text-lg mb-6">
                <i className="pi pi-map-marker text-emerald-300"></i>
                <span>{tour.startLocation}</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  label="Book Now" 
                  icon="pi pi-check" 
                  className="p-button-lg p-button-success" 
                  onClick={handleBookNow}
                />
                <Button 
                  label="Save for Later" 
                  icon="pi pi-heart" 
                  className="p-button-lg p-button-outlined p-button-secondary" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 -mt-16 relative z-20">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Content */}
           <div className="lg:col-span-2">
  {/* Tabs */}
  <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
    <div className="flex border-b">
      {["overview", "itinerary", "reviews"].map((tab) => (
        <button
          key={tab}
          className={`px-6 py-4 font-semibold capitalize transition-colors duration-200 ${
            activeTab === tab 
              ? "text-emerald-600 border-b-2 border-emerald-600" 
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>

    {/* Tab Content */}
    <div className="p-6">
      {activeTab === "overview" && (
        <>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">About This Tour</h3>
          <p className="text-gray-700 mb-6 text-lg leading-relaxed">
            {tour.summary || "No description available."}
          </p>
          
          <Divider />
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Tour Details</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-medium">Start Date:</span> {tour.startDates || "To be confirmed"}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-medium">Start Location:</span> {tour.startLocation || "Not specified"}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-medium">Duration:</span> {tour.duration} days
                  </span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Pricing</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-medium">Price:</span> ${tour.price}
                  </span>
                </li>
                {tour.priceDiscount && (
                  <li className="flex items-start gap-3">
                    <BadgePercent className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      <span className="font-medium">Discount:</span> ${tour.priceDiscount} off
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          <Divider />
          
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Tour Highlights</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              `Small group size (${tour.maxGroupSize} max)`,
              `${tour.difficulty} Difficulty level`,
              "Expert tour guides",
              "All necessary equipment included",
              "Accommodation included",
              "Meals as per itinerary"
            ].map((highlight, index) => (
              <div key={index} className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{highlight}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "itinerary" && (
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Daily Itinerary</h3>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <Info className="w-10 h-10 text-gray-400 mb-4 mx-auto" />
            <p className="text-gray-500 text-lg">Detailed itinerary coming soon...</p>
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Customer Reviews</h3>
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="text-5xl font-bold text-gray-800">
                {tour.ratingsAverage ? tour.ratingsAverage.toFixed(1) : "0"}
                <span className="text-2xl text-gray-500">/5</span>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(tour.ratingsAverage || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mt-2">
                  Based on {tour.ratingsQuantity || 0} reviews
                </p>
              </div>
            </div>
            <Button 
              label={reviews.length ? "Write a Review" : "Write First Review"} 
              icon={<PenLine className="w-4 h-4 mr-2" />}
              className="p-button-outlined"
              onClick={() => setShowReviewForm(true)}
            />
          </div>

          {showReviewForm && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">Write Your Review</h4>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-8 h-8 cursor-pointer ${
                          i < reviewForm.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-300"
                        }`}
                        onClick={() => setReviewForm({...reviewForm, rating: i + 1})}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm({...reviewForm, review: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    rows={4}
                    placeholder="Share your experience..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    label="Submit Review" 
                    icon={<Check className="w-4 h-4 mr-2" />}
                    className="p-button-success"
                  />
                  <Button 
                    type="button" 
                    label="Cancel" 
                    icon={<X className="w-4 h-4 mr-2" />}
                    className="p-button-outlined p-button-secondary"
                    onClick={() => setShowReviewForm(false)}
                  />
                </div>
              </form>
            </div>
          )}

          {reviews.length > 0 ? (
            <div className="space-y-6">
  {reviews.map((review) => (
    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
          {review.userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h5 className="font-bold text-gray-800">{review.userName}</h5>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* ✅ Show Delete button only if review.userId === authUser.id */}
        {authUser?.id === review.userId && (
          <button
            onClick={() => handleDeleteReview(review.id)}
            className="text-red-500 hover:underline text-sm"
          >
           <Trash2 className="w-4 h-4 mr-2" />
          </button>
        )}
      </div>
      <p className="text-gray-700 pl-14">{review.review}</p>
    </div>
  ))}
</div>

          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Star className="w-10 h-10 text-gray-400 mb-4 mx-auto" />
              <p className="text-gray-500 text-lg mb-4">No reviews yet. Be the first to review!</p>
              <Button 
                label="Write First Review" 
                icon={<PenLine className="w-4 h-4 mr-2" />}
                className="p-button-outlined"
                onClick={() => setShowReviewForm(true)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  </div>
</div>

            {/* Booking Sidebar (unchanged from your original code) */}
            {/* ... */}
         
            <BookingForm/>
          </div>
        </div>
      </div>
    </>
  );
}