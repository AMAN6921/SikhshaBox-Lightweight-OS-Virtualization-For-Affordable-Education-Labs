import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users } from 'lucide-react';

function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate('/login', { state: { role } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome to Contain-R
          </h1>
          <p className="text-lg text-gray-600">
            Select your role to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Student Card */}
          <button
            onClick={() => handleRoleSelect('student')}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-blue-100 rounded-full p-6 group-hover:bg-blue-500 transition-colors duration-300">
                <GraduationCap size={64} className="text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Student</h2>
              <p className="text-gray-600 text-center">
                Access your personal Linux workspace and manage your container
              </p>
              <div className="mt-4 text-blue-600 font-semibold group-hover:text-blue-700">
                Continue as Student →
              </div>
            </div>
          </button>

          {/* Instructor Card */}
          <button
            onClick={() => handleRoleSelect('instructor')}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border-2 border-transparent hover:border-indigo-500"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-indigo-100 rounded-full p-6 group-hover:bg-indigo-500 transition-colors duration-300">
                <Users size={64} className="text-indigo-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Instructor</h2>
              <p className="text-gray-600 text-center">
                Manage student workspaces, users, and monitor system analytics
              </p>
              <div className="mt-4 text-indigo-600 font-semibold group-hover:text-indigo-700">
                Continue as Instructor →
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;