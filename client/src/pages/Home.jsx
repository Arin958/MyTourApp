import { useEffect, useRef, useState } from "react";
import { getTours } from "../services/tourService";
import { Toast } from "primereact/toast";
import { Link } from "react-router-dom";
import { Rating } from "primereact/rating";
import Hero from "../components/Hero";
import AboutSection from "../components/About";
import TestimonialSection from "../components/Testimonial";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Home() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredTours, setFeaturedTours] = useState([]);
  const toast = useRef(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await getTours();
      setTours(response.data.tours);
      // Get 3 random featured tours
      setFeaturedTours(response.data.tours.sort(() => 0.5 - Math.random()).slice(0, 3));
    } catch (error) {
      showToast("error", "Error", "Failed to load tours");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (severity, summary, detail) => {
    toast.current.show({
      severity,
      summary,
      detail,
      life: 3000,
    });
  };

  return (
    <div className="bg-gray-50">
      <Toast ref={toast} />
      
   
      
      {/* Featured Tours */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Featured Adventures
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular tours chosen by travelers worldwide
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {featuredTours.map((tour) => (
                <div key={tour.id} className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                  <Link to={`/tours/${tour.slug}`}>
                    <div className="relative h-full bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={`${API}/uploads/${tour.coverImage}`}
                          alt={tour.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/600x400?text=No+Image";
                            e.target.onerror = null;
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <h3 className="text-xl font-bold text-white">{tour.title}</h3>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-emerald-600 font-bold text-xl">
                              ${tour.price}
                            </span>
                            {tour.priceDiscount && (
                              <span className="line-through text-sm text-gray-400 ml-2">
                                ${parseFloat(tour.price) + parseFloat(tour.priceDiscount)}
                              </span>
                            )}
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                            {tour.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {tour.summary}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Rating
                              value={tour.ratingsAverage}
                              readOnly
                              cancel={false}
                              stars={5}
                              className="text-sm"
                            />
                            <span className="text-xs text-gray-500 ml-1">
                              ({tour.ratingsQuantity})
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {tour.duration} days
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* All Tours Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Explore Our Tours
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find your perfect adventure from our wide selection of tours
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <Link to={`/tours/${tour.slug}`} key={tour.id}>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={`${API}/uploads/${tour.coverImage}`}
                        alt={tour.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/600x400?text=No+Image";
                          e.target.onerror = null;
                        }}
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          {tour.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {tour.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {tour.summary}
                      </p>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 text-yellow-400 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">
                            {tour.ratingsAverage}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({tour.ratingsQuantity})
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {tour.duration} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-600 font-bold">
                          ${tour.price}
                        </span>
                        {tour.priceDiscount && (
                          <span className="text-xs text-gray-400 line-through">
                            ${parseFloat(tour.price) + parseFloat(tour.priceDiscount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <AboutSection />

      {/* Testimonial Section */}
      <TestimonialSection />

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of happy travelers who have experienced the world with us
          </p>
          <Link
            to="/tours"
            className="inline-block bg-white text-emerald-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition duration-300 shadow-lg"
          >
            Browse All Tours
          </Link>
        </div>
      </section>
    </div>
  );
}