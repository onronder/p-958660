
import React from 'react';

const Profile = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-6">
          Manage your profile information and account settings.
        </p>
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">Profile management will be implemented in a future update.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
