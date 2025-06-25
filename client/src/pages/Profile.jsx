import React, { useEffect, useState } from "react";
import { getProfile } from "../../services/authServices"; // Adjust the path as needed

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        console.log(response.data);
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Welcome, {profile?.user?.name}</h1>
      <p>Email: {profile?.user?.email}</p>
      {/* Add more profile details here */}
    </div>
  );
};

export default ProfilePage;
