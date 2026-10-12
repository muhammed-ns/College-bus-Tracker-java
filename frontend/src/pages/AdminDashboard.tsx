import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bus, Route, Stop, Trip, DriverSummary } from '../types';
import StatusBadge from '../components/StatusBadge';
import {
  Bus as BusIcon,
  MapPin,
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  UserPlus,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [bus, setBus] = useState<Bus | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [driver, setDriver] = useState<DriverSummary | null>(null);

  // Form states for Bus edit
  const [isEditingBus, setIsEditingBus] = useState(false);
  const [busForm, setBusForm] = useState({
    busNumber: '',
    registrationNumber: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  // Form states for Stop add/edit
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [editingStopId, setEditingStopId] = useState<number | null>(null);
  const [stopForm, setStopForm] = useState({
    stopName: '',
    latitude: 9.1324,
    longitude: 76.7182,
    stopOrder: 1,
  });

  // Form states for Driver create
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverForm, setDriverForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [busRes, routeRes, tripRes, driverRes] = await Promise.allSettled([
        api.get<Bus>('/bus'),
        api.get<Route>('/route'),
        api.get<Trip>('/trip/active'),
        api.get<DriverSummary>('/admin/driver'),
      ]);

      if (busRes.status === 'fulfilled') {
        setBus(busRes.value.data);
        setBusForm({
          busNumber: busRes.value.data.busNumber,
          registrationNumber: busRes.value.data.registrationNumber,
          status: busRes.value.data.status,
        });
      }
      if (routeRes.status === 'fulfilled') setRoute(routeRes.value.data);
      if (tripRes.status === 'fulfilled') setTrip(tripRes.value.data);
      if (driverRes.status === 'fulfilled') setDriver(driverRes.value.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- BUS ACTIONS ---
  const handleSaveBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put<Bus>('/admin/bus', busForm);
      setBus(res.data);
      setIsEditingBus(false);
      showNotice('success', 'Bus details successfully updated');
    } catch (err: any) {
      showNotice('error', err.response?.data?.message || 'Failed to update bus');
    }
  };

  // --- STOP ACTIONS ---
  const openAddStopModal = () => {
    const nextOrder = route?.stops ? route.stops.length + 1 : 1;
    setEditingStopId(null);
    setStopForm({
      stopName: '',
      latitude: 9.1324,
      longitude: 76.7182,
      stopOrder: nextOrder,
    });
    setIsStopModalOpen(true);
  };

  const openEditStopModal = (s: Stop) => {
    setEditingStopId(s.id);
    setStopForm({
      stopName: s.stopName,
      latitude: s.latitude,
      longitude: s.longitude,
      stopOrder: s.stopOrder,
    });
    setIsStopModalOpen(true);
  };

  const handleSaveStop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStopId) {
        await api.put(`/admin/stops/${editingStopId}`, stopForm);
        showNotice('success', 'Stop updated successfully');
      } else {
        await api.post('/admin/stops', stopForm);
        showNotice('success', 'New stop added successfully');
      }
      setIsStopModalOpen(false);
      loadData();
    } catch (err: any) {
      showNotice('error', err.response?.data?.message || 'Failed to save stop');
    }
  };

  const handleDeleteStop = async (stopId: number) => {
    if (!window.confirm('Are you sure you want to delete this stop?')) return;
    try {
      await api.delete(`/admin/stops/${stopId}`);
      showNotice('success', 'Stop deleted successfully');
      loadData();
    } catch (err: any) {
      showNotice('error', err.response?.data?.message || 'Failed to delete stop');
    }
  };

  // --- DRIVER ACTIONS ---
  const handleToggleDriverStatus = async () => {
    if (!driver) return;
    try {
      const res = await api.patch<DriverSummary>(`/admin/driver/${driver.id}/status?enabled=${!driver.enabled}`);
      setDriver(res.data);
      showNotice('success', `Driver account ${res.data.enabled ? 'Enabled' : 'Disabled'}`);
    } catch (err: any) {
      showNotice('error', err.response?.data?.message || 'Failed to toggle driver status');
    }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<DriverSummary>('/admin/driver', driverForm);
      setDriver(res.data);
      setIsDriverModalOpen(false);
      setDriverForm({ name: '', email: '', password: '' });
      showNotice('success', 'Driver account created successfully');
    } catch (err: any) {
      showNotice('error', err.response?.data?.message || 'Failed to create driver account');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/20 text-blue-100 inline-block mb-2">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Management Console</h1>
          <p className="text-blue-100 text-sm mt-1">
            Manage transit fleet, route stops, driver authentication, and active trip status.
          </p>
        </div>

        {/* Live Trip Indicator */}
        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-right">
          <p className="text-xs text-blue-200">Active Trip Status</p>
          <div className="mt-1">
            <StatusBadge type="trip" status={trip?.status || 'NOT_STARTED'} />
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-2xl border flex items-start space-x-3 text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Bus & Driver Details */}
        <div className="space-y-6">
          {/* BUS MANAGEMENT CARD */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BusIcon className="w-5 h-5 text-blue-600" />
                <span>Bus Details</span>
              </h2>
              {!isEditingBus && (
                <button
                  onClick={() => setIsEditingBus(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditingBus ? (
              <form onSubmit={handleSaveBus} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Bus Number</label>
                  <input
                    type="text"
                    value={busForm.busNumber}
                    onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Registration</label>
                  <input
                    type="text"
                    value={busForm.registrationNumber}
                    onChange={(e) => setBusForm({ ...busForm, registrationNumber: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <select
                    value={busForm.status}
                    onChange={(e) => setBusForm({ ...busForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingBus(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-400 block font-medium">Bus Label</span>
                  <span className="text-base font-bold text-slate-800">{bus?.busNumber}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-400 block font-medium">Registration Plate</span>
                  <span className="text-base font-mono font-bold text-slate-800">{bus?.registrationNumber}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Fleet Status</span>
                    <span className="text-sm font-semibold text-slate-800">{bus?.status}</span>
                  </div>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${bus?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  ></span>
                </div>
              </div>
            )}
          </div>

          {/* DRIVER ACCOUNT CARD */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span>Driver Account</span>
              </h2>
              <button
                onClick={() => setIsDriverModalOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add / Reset</span>
              </button>
            </div>

            {driver ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-400 block font-medium">Assigned Driver</span>
                  <span className="text-base font-bold text-slate-800">{driver.name}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-400 block font-medium">Login Email</span>
                  <span className="text-sm font-mono text-slate-800">{driver.email}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Account Access</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        driver.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {driver.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleDriverStatus}
                    className="flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    title={driver.enabled ? 'Disable driver account' : 'Enable driver account'}
                  >
                    {driver.enabled ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-3">No driver account found.</p>
                <button
                  onClick={() => setIsDriverModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  Create Driver Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Route and Stops Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
              <div>
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Route & Transit Stops</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {route?.routeName || 'Main Campus Route'} — {route?.stops?.length || 0} stops configured
                </p>
              </div>

              <button
                onClick={openAddStopModal}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Stop</span>
              </button>
            </div>

            {/* Stops Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-2">Order</th>
                    <th className="pb-3">Stop Name</th>
                    <th className="pb-3">Coordinates (Lat, Lng)</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {route?.stops && route.stops.length > 0 ? (
                    route.stops.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 pl-2">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                            {s.stopOrder}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-slate-800">{s.stopName}</td>
                        <td className="py-3 text-xs text-slate-500 font-mono">
                          {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                        </td>
                        <td className="py-3 pr-2 text-right space-x-2">
                          <button
                            onClick={() => openEditStopModal(s)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Stop"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStop(s.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Stop"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                        No stops configured yet. Click "Add Stop" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* STOP ADD/EDIT MODAL */}
      {isStopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingStopId ? 'Edit Transit Stop' : 'Add New Transit Stop'}
              </h3>
              <button
                onClick={() => setIsStopModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stop Name</label>
                <input
                  type="text"
                  value={stopForm.stopName}
                  onChange={(e) => setStopForm({ ...stopForm, stopName: e.target.value })}
                  placeholder="e.g. Metro Central Station"
                  required
                  className="w-full px-3.5 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={stopForm.latitude}
                    onChange={(e) => setStopForm({ ...stopForm, latitude: parseFloat(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={stopForm.longitude}
                    onChange={(e) => setStopForm({ ...stopForm, longitude: parseFloat(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stop Sequence Order</label>
                <input
                  type="number"
                  min="1"
                  value={stopForm.stopOrder}
                  onChange={(e) => setStopForm({ ...stopForm, stopOrder: parseInt(e.target.value) })}
                  required
                  className="w-full px-3.5 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStopModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Save Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DRIVER MODAL */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-base">Create Driver Account</h3>
              <button
                onClick={() => setIsDriverModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  placeholder="e.g. John Driver"
                  required
                  className="w-full px-3.5 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={driverForm.email}
                  onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                  placeholder="driver@college.edu"
                  required
                  className="w-full px-3.5 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={driverForm.password}
                  onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
