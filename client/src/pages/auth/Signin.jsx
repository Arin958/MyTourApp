import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../../Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaLock, FaPlane, FaMountain, FaUmbrellaBeach } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaTwitter } from "react-icons/fa";

const Signin = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        credentials
      );
      const token = res.data.token;
      console.log("JWT token:", token);

    dispatch({ type: "LOGIN_SUCCESS", payload: { token} });

      const role = JSON.parse(atob(token.split(".")[1])).role;
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("JWT payload:", payload);
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "user") {
        navigate("/");
      } else {
        navigate("/unauthorized");
      }
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: "Invalid credentials" });
    }
  };

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

  const floatVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    floatDelay: {
      y: [-15, 15, -15],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1
      }
    },
    pulse: {
      opacity: [1, 0.6, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-gray-100"
    >
      {/* Left Side - Visual */}
      <motion.div 
        variants={itemVariants}
        className="md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-900 text-white p-8 flex flex-col justify-center items-center relative overflow-hidden"
      >
        <div className="relative w-48 h-48 mb-8">
          <motion.div
            variants={floatVariants}
            animate="float"
            className="absolute top-4 left-4"
          >
            <FaPlane className="text-4xl text-blue-200" />
          </motion.div>
          
          <motion.div
            variants={floatVariants}
            animate="floatDelay"
            className="absolute bottom-4 right-4"
          >
            <FaMountain className="text-4xl text-blue-200" />
          </motion.div>
          
          <motion.div
            variants={floatVariants}
            animate="pulse"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <FaUmbrellaBeach className="text-4xl text-yellow-200" />
          </motion.div>
        </div>
        
        <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Welcome Back Explorer
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-lg text-blue-100 text-center max-w-md">
          Sign in to continue your journey with us
        </motion.p>
        
        {/* Decorative elements */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-blue-700 opacity-10"
        />
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-blue-500 opacity-10"
        />
      </motion.div>
      
      {/* Right Side - Form */}
      <motion.div 
        variants={itemVariants}
        className="md:w-1/2 p-8 flex justify-center items-center"
      >
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="w-full max-w-md bg-white rounded-xl shadow-lg p-8"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <motion.div 
              whileHover={{ rotate: 360 }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </motion.div>
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Sign In
          </motion.h2>
          
          <motion.p variants={itemVariants} className="text-gray-600 mb-6 text-center">
            Enter your details to access your account
          </motion.p>
          
          <motion.form 
            variants={containerVariants}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </motion.div>
            
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <label className="flex items-center text-gray-700">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="ml-2">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 text-sm">Forgot password?</Link>
            </motion.div>
            
            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md"
            >
              Sign In
            </motion.button>
            
            <motion.div variants={itemVariants} className="text-center text-gray-600">
              Don't have an account? <a href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">Sign up</a>
            </motion.div>
            
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex justify-center space-x-4">
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button" 
                className="p-3 rounded-full border border-gray-300 hover:bg-gray-50 transition duration-200"
              >
                <FcGoogle className="text-xl" />
              </motion.button>
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button" 
                className="p-3 rounded-full border border-gray-300 hover:bg-gray-50 transition duration-200 text-blue-600"
              >
                <FaFacebook className="text-xl" />
              </motion.button>
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button" 
                className="p-3 rounded-full border border-gray-300 hover:bg-gray-50 transition duration-200 text-blue-400"
              >
                <FaTwitter className="text-xl" />
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Signin;