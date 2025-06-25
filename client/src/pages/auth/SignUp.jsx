import axios from "axios";
import { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Message } from "primereact/message";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import { registerUser } from "../../services/authServices";
import { motion } from "framer-motion";
import { FaPlane, FaMapMarkedAlt, FaPassport, FaEnvelope, FaLock } from "react-icons/fa";

export default function SignUp() {
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters long"),
    confirmPassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("password"), null], "Passwords must match"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const { name, email, password } = values;
      const res = await registerUser({ name, email, password });
      console.log("Registration successful:", res.data);
      resetForm();
      // Optionally redirect or show success message
    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormFieldInvalid = (name, errors, touched) =>
    !!(errors[name] && touched[name]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          {/* Header with travel theme */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white relative">
            <div className="absolute top-4 right-4 opacity-20">
              <FaPlane className="text-4xl transform rotate-45" />
            </div>
            <div className="absolute bottom-4 left-4 opacity-20">
              <FaMapMarkedAlt className="text-4xl" />
            </div>
            <motion.h3 
              variants={itemVariants}
              className="text-2xl font-bold mb-1"
            >
              Join Our Travel Community
            </motion.h3>
            <motion.p 
              variants={itemVariants}
              className="text-blue-100"
            >
              Create your account to start exploring
            </motion.p>
          </div>

          <div className="p-6">
            {submitError && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Message severity="error" text={submitError} />
              </motion.div>
            )}

            <Formik
              initialValues={{
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
              }) => (
                <form 
                  className="flex flex-col gap-4" 
                  onSubmit={handleSubmit}
                >
                  <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <label htmlFor="name" className="font-medium flex items-center gap-2">
                      <FaPassport className="text-blue-500" />
                      Full Name
                    </label>
                    <InputText
                      id="name"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your name"
                      className={classNames({
                        "p-invalid": isFormFieldInvalid("name", errors, touched),
                        "w-full": true
                      })}
                    />
                    {isFormFieldInvalid("name", errors, touched) && (
                      <Message severity="error" text={errors.name} />
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <label htmlFor="email" className="font-medium flex items-center gap-2">
                      <FaEnvelope className="text-blue-500" />
                      Email
                    </label>
                    <InputText
                      id="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your email"
                      className={classNames({
                        "p-invalid": isFormFieldInvalid("email", errors, touched),
                        "w-full": true
                      })}
                    />
                    {isFormFieldInvalid("email", errors, touched) && (
                      <Message severity="error" text={errors.email} />
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <label htmlFor="password" className="font-medium flex items-center gap-2">
                      <FaLock className="text-blue-500" />
                      Password
                    </label>
                    <Password
                      id="password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      toggleMask
                      placeholder="Enter your password"
                      className={classNames({
                        "p-invalid": isFormFieldInvalid("password", errors, touched),
                        "w-full": true
                      })}
                      feedback={false}
                      inputClassName="w-full"
                    />
                    {isFormFieldInvalid("password", errors, touched) && (
                      <Message severity="error" text={errors.password} />
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <label htmlFor="confirmPassword" className="font-medium flex items-center gap-2">
                      <FaLock className="text-blue-500" />
                      Confirm Password
                    </label>
                    <Password
                      id="confirmPassword"
                      name="confirmPassword"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      toggleMask
                      placeholder="Confirm your password"
                      className={classNames({
                        "p-invalid": isFormFieldInvalid(
                          "confirmPassword",
                          errors,
                          touched
                        ),
                        "w-full": true
                      })}
                      feedback={false}
                      inputClassName="w-full"
                    />
                    {isFormFieldInvalid("confirmPassword", errors, touched) && (
                      <Message severity="error" text={errors.confirmPassword} />
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      label="Create Account"
                      icon="pi pi-user-plus"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      className="w-full mt-2 bg-gradient-to-r from-blue-600 to-cyan-500 border-none hover:from-blue-700 hover:to-cyan-600"
                      rounded
                    />
                  </motion.div>
                </form>
              )}
            </Formik>

            <motion.div 
              variants={itemVariants}
              className="mt-4 text-center text-sm text-gray-600"
            >
              Already have an account?{' '}
              <a 
                href="/signin" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign In
              </a>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}