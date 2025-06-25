import React from "react";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { Link } from "react-router-dom";

const Base_URL = "http://localhost:3000";

const validationSchema = Yup.object({
  name: Yup.string().required("Full Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const Register = () => {
  const [message, setMessage] = React.useState("");
  const [severity, setSeverity] = React.useState("success");

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const { confirmPassword, ...payload } = values; // exclude confirmPassword from backend
      const res = await axios.post(`${Base_URL}/api/auth/register`, payload);
      setMessage(res.data.message || "Registration successful!");
      setSeverity("success");
      resetForm();
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Something went wrong during registration."
      );
      setSeverity("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-green-100 via-white to-green-100 px-4">
      <Card className="w-full max-w-md shadow-2xl p-5 border-round-xl" title={null}>
        <div className="text-center mb-5">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Your Account</h2>
          <p className="text-gray-500">Join us by filling in the information below</p>
        </div>

        <Formik
          initialValues={{ name: "", email: "", password: "", confirmPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, values, errors, touched }) => (
            <Form className="p-fluid space-y-4">

              {/* Name */}
              <div className="field">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Field
                  name="name"
                  as={InputText}
                  id="name"
                  placeholder="Enter your full name"
                  className="w-full"
                />
                {touched.name && errors.name && (
                  <small className="p-error block mt-1">{errors.name}</small>
                )}
              </div>

              {/* Email */}
              <div className="field">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Field
                  name="email"
                  as={InputText}
                  id="email"
                  placeholder="Enter your email"
                  className="w-full"
                />
                {touched.email && errors.email && (
                  <small className="p-error block mt-1">{errors.email}</small>
                )}
              </div>

              {/* Password */}
              <div className="field">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Password
                  id="password"
                  name="password"
                  value={values.password}
                  onChange={(e) => setFieldValue("password", e.target.value)}
                  placeholder="Enter your password"
                  toggleMask
                  feedback={false}
                  className="w-full"
                />
                {touched.password && errors.password && (
                  <small className="p-error block mt-1">{errors.password}</small>
                )}
              </div>

              {/* Confirm Password */}
              <div className="field">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <Password
                  id="confirmPassword"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={(e) => setFieldValue("confirmPassword", e.target.value)}
                  placeholder="Confirm your password"
                  toggleMask
                  feedback={false}
                  className="w-full"
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <small className="p-error block mt-1">{errors.confirmPassword}</small>
                )}
              </div>

              <Button 
                type="submit" 
                label={isSubmitting ? "Registering..." : "Register"} 
                icon="pi pi-user-plus"
                className="w-full mt-3"
                disabled={isSubmitting}
              />

              {message && (
                <Message 
                  severity={severity} 
                  text={message} 
                  className="w-full mt-4"
                />
              )}

              <Divider className="my-4" />

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?
                  <Link to="/login" className="text-green-600 font-semibold ml-1 hover:underline">
                    Login here
                  </Link>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default Register;
