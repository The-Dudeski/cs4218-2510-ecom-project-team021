import React, { useState, useEffect } from "react";
import UserMenu from "../../components/UserMenu";
import Layout from "./../../components/Layout";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import axios from "axios";
const Profile = () => {
  // Context
  const [auth, setAuth] = useAuth();
  
  // States for user data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Store original user data for comparison
  const [originalUser, setOriginalUser] = useState({});

  // Set user data
  useEffect(() => {
    if (auth?.user) {
      const { email, name, phone, address } = auth.user;
      setName(name);
      setPhone(phone);
      setEmail(email);
      setAddress(address);
      setOriginalUser({ name, email, phone, address });
    }
  }, [auth?.user])

  // form function
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enforce presence of old password for any updates
    if (!oldPassword) {
      toast.error("Please enter your current password to make changes.");
      return;
    }

    // Check if no changes made
    const hasNoChange =
      name === originalUser.name &&
      phone === originalUser.phone &&
      address === originalUser.address &&
      !newPassword &&
      !confirmPassword;

    if (hasNoChange) {
      toast.error("No changes detected.");
      return;
    }

    // Validate password change (if attempted)
    if (newPassword || confirmPassword) {
      if (!newPassword || !confirmPassword) {
        toast.error("Please fill in all password fields.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match.");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long.");
        return;
      }
    }

    try {
      const { data } = await axios.put("/api/v1/auth/profile", {
        name,
        email,
        phone,
        address,
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (data?.error) {
        toast.error(data?.error || 'Failed to update profile.');
        return
      }
        
      setAuth({ ...auth, user: data.updatedUser });
      let ls = JSON.parse(localStorage.getItem("auth"));
      ls.user = data.updatedUser;
      localStorage.setItem("auth", JSON.stringify(ls));

      toast.success(data?.message || "Profile updated successfully.");

      // Clear password fields after successful update
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {

      console.error(error);
      const msg = error.response?.data?.message || "Something went wrong while updating.";
      toast.error(msg);
    }
  };

  return (
    <Layout title={"Your Profile"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <UserMenu />
          </div>
          <div className="col-md-9">
            <div className="form-container ">
              <form onSubmit={handleSubmit}>
                <h4 className="title">USER PROFILE</h4>

                <div className="mb-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                    id="exampleInputEmail1"
                    placeholder="Enter Your Name"
                    autoFocus
                    required
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    id="exampleInputEmail1"
                    placeholder="Enter Your Email "
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-control"
                    placeholder="Enter Your Phone"
                    required
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-control"
                    placeholder="Enter Your Address"
                    required
                  />
                </div>

                <h6>Security Verification</h6>

                {/* Old Password */}
                <div className="mb-3">
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="form-control"
                    placeholder="Enter your current password (required for any changes)"
                    required
                  />
                </div>

                {/* New Password (optional) */}
                <div className="mb-3">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-control"
                    placeholder="Enter new password (optional)"
                  />
                </div>

                {/* Confirm Password (optional) */}
                <div className="mb-3">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control"
                    placeholder="Confirm new password"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  UPDATE
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;