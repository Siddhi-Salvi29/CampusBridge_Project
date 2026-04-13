import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Label } from "../label.jsx";
import { Input } from "../input.jsx";

const REQUIRED_COLLEGE_DOMAIN = "@rmcet.com";

const Register = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "Student",
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState("");

  const changeInputHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const fileChangeHandler = (e) => {
    setProfilePhoto(e.target.files[0]);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    const emailLower = input.email.toLowerCase();

    if (!emailLower.endsWith(REQUIRED_COLLEGE_DOMAIN)) {
      setError(`Please use your official College Email ending with ${REQUIRED_COLLEGE_DOMAIN} to register.`);
      return;
    }

    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("password", input.password);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("role", input.role);
    if (profilePhoto) formData.append("profile_photo", profilePhoto);

    try {
      const res = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        navigate("/otp-verification", {
          state: {
            email: input.email,
            fullname: input.fullname,
            password: input.password,
            phoneNumber: input.phoneNumber,
            role: input.role,
          },
        });
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Frontend Error:", err);
      setError("Server error, try again later.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="w-1/2 bg-blue-800 text-white flex flex-col justify-center items-center p-10">
        <img src="/bridge-logo.jpg" alt="Logo" className="w-32 mb-6" />
        <h1 className="text-3xl font-bold mb-3">Join Us!</h1>
        <p className="text-sm text-blue-200">Register to create an account and start using the portal.</p>
      </div>

      <div className="w-1/2 flex flex-col justify-center items-center p-4 overflow-y-auto">
        <div className="w-full max-w-sm bg-white shadow-2xl rounded-xl p-6 py-8 border border-gray-200">
          <div className="flex flex-col items-center mb-6">
            <img src="/rmcetlogo1.jpg" alt="RMCET Logo" className="w-16 h-16 mb-2" />
            <h1 className="text-xl font-bold text-gray-800 tracking-wide mt-1">Student Placement Portal</h1>
            <p className="text-sm text-gray-500 text-center mt-1">Enter your details to create an account</p>
          </div>

          {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}

          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input type="text" name="fullname" value={input.fullname} onChange={changeInputHandler} placeholder="John Doe" required className="bg-blue-50/70 border-blue-200" />
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" name="email" value={input.email} onChange={changeInputHandler} placeholder={`name${REQUIRED_COLLEGE_DOMAIN}`} required className="bg-blue-50/70 border-blue-200" />
              <p className="mt-1 text-xs text-blue-600">Must use College Email ({REQUIRED_COLLEGE_DOMAIN})</p>
            </div>

            <div>
              <Label>Password</Label>
              <Input type="password" name="password" value={input.password} onChange={changeInputHandler} placeholder="********" required className="bg-blue-50/70 border-blue-200" />
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input type="text" name="phoneNumber" value={input.phoneNumber} onChange={changeInputHandler} placeholder="1234567890" className="bg-blue-50/70 border-blue-200" />
            </div>

            <div className="pt-1">
              <Label>Role</Label>
              <div className="flex gap-6 mt-2 text-sm">
                {["Student", "Alumini", "Admin"].map((role) => (
                  <label key={role} className="flex items-center gap-1 text-gray-700">
                    <input type="radio" name="role" value={role} checked={input.role === role} onChange={changeInputHandler} className="form-radio text-blue-600" />
                    {role}
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <Label>Profile Photo</Label>
              <Input type="file" onChange={fileChangeHandler} className="mt-1" />
            </div>

            <button type="submit" className="w-full py-3 bg-gray-800 text-white rounded-md font-semibold hover:bg-gray-900 transition duration-150 shadow-md mt-6">
              Register
            </button>
          </form>

          <p className="text-center text-sm mt-4 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-700 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
