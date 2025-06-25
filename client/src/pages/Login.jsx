import React, { useContext, useRef, useState } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { classNames } from 'primereact/utils';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

const Base_URL = "http://localhost:3000";

const Login = () => {
  const {dispatch} = useContext(AuthContext)
  const navigate = useNavigate()
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);

  const initialValues = {
    email: "",
    password: ""
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required")
  });

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    try {
      const res = await axios.post(`${Base_URL}/api/auth/login`, values);
      console.log(res.data);

      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Login successful!',
        life: 3000
      });
      


     dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          token: res.data.token,
          user: res.data.user, // if returned from backend
        },
      });
      resetForm();
      navigate("/");

      // Optional: redirect or update app state here

    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.message || 'Login failed. Please check your credentials.',
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100 px-4">
      <Toast ref={toast} position="top-right" />

      <Card className="w-full max-w-md shadow-2xl p-5 border-round-xl">
        <div className="text-center mb-5">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-500">Login to your account</p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form className="p-fluid space-y-4">

              <div className="field">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Field
                  as={InputText}
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  className={classNames({ "p-invalid": errors.email && touched.email }, "w-full")}
                />
                <ErrorMessage
                  name="email"
                  component="small"
                  className="p-error block mt-1"
                />
              </div>

              <div className="field">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Field name="password">
                  {({ field }) => (
                    <Password
                      id="password"
                      {...field}
                      placeholder="Enter your password"
                      toggleMask
                      feedback={false}
                      className={classNames({ "p-invalid": errors.password && touched.password }, "w-full")}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="password"
                  component="small"
                  className="p-error block mt-1"
                />
              </div>

              <Button
                type="submit"
                label="Login"
                icon="pi pi-sign-in"
                className="w-full mt-3"
                loading={loading}
              />

              <Divider className="my-4" />

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?
                  <Link to="/register" className="text-blue-600 font-semibold ml-1 hover:underline">
                    Register here
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

export default Login;
