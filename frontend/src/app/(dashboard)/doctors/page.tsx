"use client";

import React, { useEffect, useState } from "react";
import { 
  Stethoscope, 
  Search, 
  Plus, 
  X, 
  ChevronRight, 
  Trash2, 
  UserPlus, 
  Phone, 
  Mail, 
  Building2, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount: number;
  createdAt: string;
}

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  condition: string;
  status: string;
  admissionDate: string;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals & Drawers state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialization: "Cardiology",
    hospital: "",
    phone: "",
    email: ""
  });
  const [createError, setCreateError] = useState<string | null>(null);

  // Selected doctor for viewing assigned patients drawer
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorPatients, setDoctorPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Add patient under specific doctor modal
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: 35,
    gender: "male",
    phone: "",
    condition: "",
    status: "admitted"
  });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "8",
        ...(search && { search }),
        ...(specialization && { specialization })
      });
      const res = await api.get(`/doctors?${params.toString()}`);
      setDoctors(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [page, specialization]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    try {
      await api.post("/doctors", newDoctor);
      setShowCreateModal(false);
      setNewDoctor({
        name: "",
        specialization: "Cardiology",
        hospital: "",
        phone: "",
        email: ""
      });
      fetchDoctors();
    } catch (err: any) {
      setCreateError(err.response?.data?.error?.message || "Failed to create doctor");
    }
  };

  const openDoctorPatients = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setLoadingPatients(true);
    try {
      const res = await api.get(`/doctors/${doctor._id}/patients`);
      setDoctorPatients(res.data.data);
    } catch (err) {
      console.error("Failed to fetch doctor patients", err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleAddPatientToDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    try {
      await api.post(`/doctors/${selectedDoctor._id}/patients`, newPatient);
      setShowAddPatientModal(false);
      setNewPatient({
        name: "",
        age: 35,
        gender: "male",
        phone: "",
        condition: "",
        status: "admitted"
      });
      openDoctorPatients(selectedDoctor);
      fetchDoctors();
    } catch (err) {
      console.error("Failed to add patient to doctor", err);
    }
  };

  const handleRemovePatientFromDoctor = async (patientId: string) => {
    if (!selectedDoctor || !confirm("Are you sure you want to remove this patient from the doctor?")) return;
    try {
      await api.delete(`/doctors/${selectedDoctor._id}/patients/${patientId}`);
      openDoctorPatients(selectedDoctor);
      fetchDoctors();
    } catch (err) {
      console.error("Failed to remove patient", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attending Doctors</h1>
          <p className="text-sm text-slate-500">Registry of licensed clinical staff & patient assignments</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Doctor</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors by name, email, hospital..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="w-full md:w-auto flex items-center gap-3">
          <select
            value={specialization}
            onChange={(e) => {
              setSpecialization(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Specializations</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Oncology">Oncology</option>
            <option value="General Surgery">General Surgery</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Endocrinology">Endocrinology</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setSpecialization("");
              setPage(1);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline px-2"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse p-6" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Stethoscope className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No doctors found</h3>
          <p className="text-sm text-slate-500 mt-1">Try refining your search keyword or clearing the filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">{doc.name}</h3>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {doc.specialization}
                    </span>
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold text-right shrink-0">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Patients</p>
                    <p className="text-sm text-blue-600">{doc.patientCount}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.hospital}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{doc.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Joined: {formatDate(doc.createdAt)}
                </span>
                <button
                  onClick={() => openDoctorPatients(doc)}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <span>View Patients ({doc.patientCount})</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Drawer: Doctor's Patients List */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{selectedDoctor.name}</h3>
                <p className="text-xs text-slate-500">{selectedDoctor.specialization} • {selectedDoctor.hospital}</p>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-blue-50/50">
              <span className="text-xs font-semibold text-slate-700">
                Assigned Patients ({doctorPatients.length})
              </span>
              <button
                onClick={() => setShowAddPatientModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Assign Patient</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {loadingPatients ? (
                <div className="flex items-center justify-center h-48">
                  <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : doctorPatients.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No patients currently assigned under this doctor.
                </div>
              ) : (
                doctorPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900">{patient.name}</h4>
                        <span className="text-xs text-slate-400">({patient.age}y, {patient.gender})</span>
                      </div>
                      <p className="text-xs text-blue-600 font-medium mt-0.5">{patient.condition}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Status: <span className="capitalize font-semibold text-slate-700">{patient.status.replace("_", " ")}</span> • Admitted: {formatDate(patient.admissionDate)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemovePatientFromDoctor(patient._id)}
                      title="Remove patient from doctor"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Doctor */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Register New Doctor</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs border-b border-red-100 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDoctor} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. John Doe"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
                <select
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Oncology">Oncology</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Endocrinology">Endocrinology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Affiliated Hospital</label>
                <input
                  type="text"
                  required
                  placeholder="Central General Hospital"
                  value={newDoctor.hospital}
                  onChange={(e) => setNewDoctor({ ...newDoctor, hospital: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+880 1711..."
                    value={newDoctor.phone}
                    onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@hospital.org"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
                >
                  Register Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Patient Under Specific Doctor */}
      {showAddPatientModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Enroll Patient</h3>
                <p className="text-xs text-slate-500">Under: {selectedDoctor.name}</p>
              </div>
              <button onClick={() => setShowAddPatientModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatientToDoctor} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="Patient Full Name"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="0"
                    max="130"
                    required
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+880 1..."
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic Condition</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Coronary Syndrome"
                  value={newPatient.condition}
                  onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={newPatient.status}
                  onChange={(e) => setNewPatient({ ...newPatient, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="admitted">Admitted</option>
                  <option value="under_observation">Under Observation</option>
                  <option value="recovered">Recovered</option>
                  <option value="discharged">Discharged</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
