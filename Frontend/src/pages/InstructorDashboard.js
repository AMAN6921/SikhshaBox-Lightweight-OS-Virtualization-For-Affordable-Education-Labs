import React, { useState, useEffect } from 'react';
import { Users, Server, Plus, Trash2, Play, Square, RotateCcw, Activity } from 'lucide-react';
import Header from '../components/Header';
import StatusIndicator from '../components/StatusIndicator';
import Modal from '../components/Modal';
import { adminService } from '../services/api';

function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState('containers');
  const [containers, setContainers] = useState([]);
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '' });
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '' });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [containersData, usersData, statsData] = await Promise.all([
        adminService.getAllContainers(),
        adminService.getUsers(),
        adminService.getSystemStats()
      ]);
      
      setContainers(containersData);
      setUsers(usersData);
      setSystemStats(statsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await adminService.createUser(newUser);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'User created successfully'
      });
      setNewUser({ username: '', password: '', name: '' });
      fetchData();
    } catch (error) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to create user'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminService.deleteUser(userId);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'User deleted successfully'
      });
      fetchData();
    } catch (error) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to delete user'
      });
    }
  };

  const tabs = [
    { id: 'containers', label: 'Containers', icon: Server },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Instructor Dashboard" />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Containers Tab */}
          {activeTab === 'containers' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Containers</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uptime
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {containers.map((container) => (
                        <tr key={container.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {container.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusIndicator status={container.status} label="" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {container.uptime || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button className="text-green-600 hover:text-green-900">
                              <Play size={16} />
                            </button>
                            <button className="text-yellow-600 hover:text-yellow-900">
                              <Square size={16} />
                            </button>
                            <button className="text-blue-600 hover:text-blue-900">
                              <RotateCcw size={16} />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Add User Form */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
                
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center justify-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Add User</span>
                  </button>
                </form>
              </div>

              {/* Users List */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Users</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card text-center">
                  <h4 className="text-lg font-semibold text-gray-900">Total Users</h4>
                  <p className="text-3xl font-bold text-primary-600 mt-2">
                    {systemStats.totalUsers || 0}
                  </p>
                </div>
                
                <div className="card text-center">
                  <h4 className="text-lg font-semibold text-gray-900">Active Containers</h4>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {systemStats.activeContainers || 0}
                  </p>
                </div>
                
                <div className="card text-center">
                  <h4 className="text-lg font-semibold text-gray-900">System Load</h4>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {systemStats.systemLoad || '0%'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        type={modal.type}
      >
        <p className="text-gray-700">{modal.message}</p>
      </Modal>
    </div>
  );
}

export default InstructorDashboard;