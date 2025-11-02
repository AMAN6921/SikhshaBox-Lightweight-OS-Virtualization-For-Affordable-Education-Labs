import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Monitor, Cpu, HardDrive } from 'lucide-react';
import Header from '../components/Header';
import StatusIndicator from '../components/StatusIndicator';
import Modal from '../components/Modal';
import { containerService } from '../services/api';

function StudentDashboard() {
  const [containerStatus, setContainerStatus] = useState('stopped');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '' });
  const [systemStats, setSystemStats] = useState({
    cpu: 0,
    memory: 0,
    disk: 0
  });

  useEffect(() => {
    fetchContainerStatus();
    const interval = setInterval(fetchContainerStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchContainerStatus = async () => {
    try {
      const response = await containerService.getStatus();
      setContainerStatus(response.status);
      setSystemStats(response.stats || systemStats);
    } catch (error) {
      console.error('Failed to fetch container status:', error);
    }
  };

  const handleContainerAction = async (action) => {
    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'start':
          response = await containerService.start();
          break;
        case 'stop':
          response = await containerService.stop();
          break;
        case 'reset':
          response = await containerService.reset();
          break;
        default:
          throw new Error('Invalid action');
      }
      
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: response.message || `Container ${action} successful`
      });
      
      // Refresh status after action
      setTimeout(fetchContainerStatus, 1000);
    } catch (error) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || `Failed to ${action} container`
      });
    } finally {
      setLoading(false);
    }
  };

  const openWorkspace = () => {
    if (containerStatus === 'running') {
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Workspace Ready',
        message: 'Your workspace is running. Open your Terminal and connect to your container.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Student Dashboard" />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="card mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to your Linux Workspace</h2>
            <p className="text-gray-600">
              Manage your virtualized Linux environment for learning and development.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Container Control */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workspace Control</h3>
              
              <div className="space-y-4">
                <StatusIndicator status={containerStatus} label="Status" />
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleContainerAction('start')}
                    disabled={loading || containerStatus === 'running'}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Play size={16} />
                    <span>Start</span>
                  </button>
                  
                  <button
                    onClick={() => handleContainerAction('stop')}
                    disabled={loading || containerStatus === 'stopped'}
                    className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Square size={16} />
                    <span>Stop</span>
                  </button>
                  
                  <button
                    onClick={() => handleContainerAction('reset')}
                    disabled={loading}
                    className="btn-danger flex items-center space-x-2 disabled:opacity-50"
                  >
                    <RotateCcw size={16} />
                    <span>Reset</span>
                  </button>
                </div>
                
                {containerStatus === 'running' && (
                  <button
                    onClick={openWorkspace}
                    className="w-full btn-primary flex items-center justify-center space-x-2 mt-4"
                  >
                    <Monitor size={16} />
                    <span>Open Workspace</span>
                  </button>
                )}
              </div>
            </div>

            {/* System Resources */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Resources</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cpu size={16} className="text-blue-500" />
                    <span className="text-sm font-medium">CPU Usage</span>
                  </div>
                  <span className="text-sm text-gray-600">{systemStats.cpu}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${systemStats.cpu}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HardDrive size={16} className="text-green-500" />
                    <span className="text-sm font-medium">Memory Usage</span>
                  </div>
                  <span className="text-sm text-gray-600">{systemStats.memory}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${systemStats.memory}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HardDrive size={16} className="text-purple-500" />
                    <span className="text-sm font-medium">Disk Usage</span>
                  </div>
                  <span className="text-sm text-gray-600">{systemStats.disk}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${systemStats.disk}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
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

export default StudentDashboard;