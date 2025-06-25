import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const TourCreate = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const navigate = useNavigate();

  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    title: '',
    slug: '',
    description: '',
    summary: '',
    duration: '',
    maxGroupSize: '',
    difficulty: 'easy',
    price: '',
    priceDiscount: '',
    startDates: '',
    startLocation: '',
    locations: '',
    images: '',
    isActive: false,
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    slug: Yup.string().required('Slug is required'),
    description: Yup.string().required('Description is required'),
    summary: Yup.string().required('Summary is required'),
    duration: Yup.number().required('Duration is required').positive().integer(),
    maxGroupSize: Yup.number().required('Group size is required').positive().integer(),
    difficulty: Yup.string().required('Difficulty is required'),
    price: Yup.number().required('Price is required').min(0),
    priceDiscount: Yup.number().min(0),
    startDates: Yup.string().required('Start dates are required'),
    startLocation: Yup.string().required('Start location is required'),
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const data = new FormData();
      for (let key in values) {
        if (values[key] !== '') {
          data.append(key, values[key]);
        }
      }
      if (coverImage) data.append('coverImage', coverImage);

      const res = await axios.post(`${API}/tours`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setMessage({ text: res.data.message || 'Tour created successfully!', type: 'success' });
      setTimeout(() => navigate('/admin/tours'), 2000);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Something went wrong.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Tour</h2>

      {message.text && (
        <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ values, handleChange, setFieldValue }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Title*</label>
                <Field name="title" className="input" />
                <ErrorMessage name="title" component="div" className="text-red-600 text-sm" />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug*</label>
                <Field name="slug" className="input" />
                <ErrorMessage name="slug" component="div" className="text-red-600 text-sm" />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description*</label>
                <Field name="description" as="textarea" className="input" />
                <ErrorMessage name="description" component="div" className="text-red-600 text-sm" />
              </div>

              {/* Summary */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Summary*</label>
                <Field name="summary" as="textarea" className="input" />
                <ErrorMessage name="summary" component="div" className="text-red-600 text-sm" />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Cover Image*</label>
                <input type="file" onChange={handleFileChange} required />
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-40 rounded-md" />}
              </div>
            </div>

            {/* Duration, Group Size, Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (days)*</label>
                <Field name="duration" type="number" className="input" />
                <ErrorMessage name="duration" component="div" className="text-red-600 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Group Size*</label>
                <Field name="maxGroupSize" type="number" className="input" />
                <ErrorMessage name="maxGroupSize" component="div" className="text-red-600 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty*</label>
                <Field as="select" name="difficulty" className="input">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="difficult">Difficult</option>
                </Field>
              </div>
            </div>

            {/* Price and Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price ($)*</label>
                <Field name="price" type="number" className="input" />
                <ErrorMessage name="price" component="div" className="text-red-600 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount Price ($)</label>
                <Field name="priceDiscount" type="number" className="input" />
              </div>
            </div>

            {/* Start Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Dates*</label>
              <Field name="startDates" placeholder="YYYY-MM-DD, YYYY-MM-DD" className="input" />
              <ErrorMessage name="startDates" component="div" className="text-red-600 text-sm" />
            </div>

            {/* Start Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Location*</label>
              <Field name="startLocation" className="input" />
              <ErrorMessage name="startLocation" component="div" className="text-red-600 text-sm" />
            </div>

            {/* isActive */}
            <div className="flex items-center">
              <Field type="checkbox" name="isActive" className="mr-2" />
              <label className="text-sm text-gray-700">Active Tour</label>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-md text-white font-medium ${
                  isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Tour'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TourCreate;
