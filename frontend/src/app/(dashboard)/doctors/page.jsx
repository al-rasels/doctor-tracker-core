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
  AlertCircle,
  Users,
  ChevronLeft
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Input, 
  Select, 
  Badge, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  Sheet, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetContent,
  Skeleton
} from "@/components/ui";

/**
 * Attending Doctors Management Page.
 * Supports doctor creation, multi-parameter search/filtering, pagination,
 * and a slide-over drawer for assigning and removing patients under each doctor.
 */
export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal: Register Doctor
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialization: "Cardiology",
    hospital: "",
    phone: "",
    email: ""
  });
  const [createError, setCreateError] = useState(null);
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);

  // Drawer: Doctor's assigned patients
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Modal: Add patient under doctor
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: 35,
    gender: "male",
    phone: "",
    condition: "",
    status: "admitted"
  });
  const [isSubmittingPat, setIsSubmittingPat] = useState(false);

  /**
   * Fetches paginated doctors from backend API.
   */
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        ...(search && { search }),
        ...(specialization && { specialization })
      });
      const res = await api.get(`/doctors?${params.toString()}`);
      setDoctors(res.data.data);
      setTotalPages(res.data.meta?.totalPages || 1);
      setTotalCount(res.data.meta?.total || 0);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [page, specialization]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setIsSubmittingDoc(true);
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
    } catch (err) {
      setCreateError(err.response?.data?.error?.message || "Failed to create doctor record");
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const openDoctorPatients = async (doctor) => {
    setSelectedDoctor(doctor);
    setLoadingPatients(true);
    try {
      const res = await api.get(`/doctors/${doctor._id}/patients`);
      setDoctorPatients(res.data.data);
    } catch (err) {
      console.error("Failed to load doctor patients:", err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleAddPatientToDoctor = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setIsSubmittingPat(true);
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
      // Refresh drawer list and doctor card list
      await openDoctorPatients(selectedDoctor);
      fetchDoctors();
    } catch (err) {
      console.error("Failed to enroll patient:", err);
    } finally {
      setIsSubmittingPat(false);
    }
  };

  const handleRemovePatientFromDoctor = async (patientId) => {
    if (!selectedDoctor) return;
    if (!window.confirm("Remove this patient from the doctor's active patient list?")) return;
    try {
      await api.delete(`/doctors/${selectedDoctor._id}/patients/${patientId}`);
      await openDoctorPatients(selectedDoctor);
      fetchDoctors();
    } catch (err) {
      console.error("Failed to remove patient:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Attending Doctors Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Licensed physician registry & active patient caseloads
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="gap-2 self-start sm:self-auto shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Doctor</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search doctors by name, email, hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </form>

          <div className="w-full md:w-auto flex items-center gap-2.5">
            <div className="w-full md:w-48">
              <Select
                value={specialization}
                onChange={(e) => {
                  setSpecialization(e.target.value);
                  setPage(1);
                }}
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
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setSpecialization("");
                setPage(1);
              }}
              className="text-xs shrink-0"
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Doctors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <Card className="p-12 text-center">
          <Stethoscope className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No doctors found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or reset the specialization filter.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => (
            <Card
              key={doc._id}
              className="hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <CardContent className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">
                      {doc.name}
                    </h3>
                    <Badge variant="info" className="mt-1 font-semibold">
                      {doc.specialization}
                    </Badge>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/60 text-right shrink-0">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Caseload</p>
                    <p className="text-sm font-extrabold text-blue-600">{doc.patientCount}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 my-4">
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
              </CardContent>

              <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Joined: {formatDate(doc.createdAt)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDoctorPatients(doc)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 gap-1 h-8 px-2.5"
                >
                  <span>Patients ({doc.patientCount})</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-500">
            Showing page {page} of {totalPages} ({totalCount} total doctors)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="gap-1 h-8 text-xs font-semibold"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1 h-8 text-xs font-semibold"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Drawer: Doctor's Patients List */}
      <Sheet
        open={Boolean(selectedDoctor)}
        onOpenChange={(open) => !open && setSelectedDoctor(null)}
        side="right"
      >
        {selectedDoctor && (
          <div className="flex flex-col h-full bg-white">
            <SheetHeader onClose={() => setSelectedDoctor(null)}>
              <SheetTitle className="text-base">{selectedDoctor.name}</SheetTitle>
              <SheetDescription>
                {selectedDoctor.specialization} • {selectedDoctor.hospital}
              </SheetDescription>
            </SheetHeader>

            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/40">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                <span>Assigned In-Patients ({doctorPatients.length})</span>
              </span>
              <Button
                size="sm"
                onClick={() => setShowAddPatientModal(true)}
                className="gap-1.5 h-8 text-xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Assign Patient</span>
              </Button>
            </div>

            <SheetContent className="space-y-3">
              {loadingPatients ? (
                <div className="flex items-center justify-center h-48">
                  <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : doctorPatients.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs sm:text-sm">
                  No active patients currently assigned under this physician.
                </div>
              ) : (
                doctorPatients.map((patient) => (
                  <Card key={patient._id} className="p-3.5 hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{patient.name}</h4>
                          <span className="text-[11px] text-slate-400">
                            ({patient.age}y, {patient.gender})
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 font-semibold mt-0.5">
                          {patient.condition}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Status:{" "}
                          <span className="capitalize font-bold text-slate-700">
                            {patient.status.replace("_", " ")}
                          </span>{" "}
                          • Admitted: {formatDate(patient.admissionDate)}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePatientFromDoctor(patient._id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Remove patient from doctor"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </SheetContent>
          </div>
        )}
      </Sheet>

      {/* Dialog Modal: Register New Doctor */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent onClose={() => setShowCreateModal(false)}>
          <DialogHeader>
            <DialogTitle>Register Attending Doctor</DialogTitle>
            <DialogDescription>
              Add a new credentialed medical specialist to the care provider network.
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateDoctor} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Doctor Full Name
              </label>
              <Input
                type="text"
                required
                placeholder="Dr. Eleanor Vance"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Medical Specialization
              </label>
              <Select
                value={newDoctor.specialization}
                onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Oncology">Oncology</option>
                <option value="General Surgery">General Surgery</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Endocrinology">Endocrinology</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hospital Affiliation
              </label>
              <Input
                type="text"
                required
                placeholder="Central Metropolitan Hospital"
                value={newDoctor.hospital}
                onChange={(e) => setNewDoctor({ ...newDoctor, hospital: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <Input
                  type="text"
                  required
                  placeholder="+880 1711..."
                  value={newDoctor.phone}
                  onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="physician@careguide.com"
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingDoc}>
                {isSubmittingDoc ? "Saving..." : "Register Doctor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Modal: Add Patient Under Specific Doctor */}
      <Dialog open={showAddPatientModal} onOpenChange={setShowAddPatientModal}>
        <DialogContent onClose={() => setShowAddPatientModal(false)}>
          <DialogHeader>
            <DialogTitle>Enroll Patient Under Doctor</DialogTitle>
            <DialogDescription>
              Assign a new in-patient directly under {selectedDoctor?.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPatientToDoctor} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Patient Name
              </label>
              <Input
                type="text"
                required
                placeholder="Full Name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Age
                </label>
                <Input
                  type="number"
                  min="0"
                  max="130"
                  required
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gender
                </label>
                <Select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contact Phone
              </label>
              <Input
                type="text"
                required
                placeholder="+880 1..."
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Diagnostic Condition
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Acute Coronary Syndrome"
                value={newPatient.condition}
                onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <Select
                value={newPatient.status}
                onChange={(e) => setNewPatient({ ...newPatient, status: e.target.value })}
              >
                <option value="admitted">Admitted</option>
                <option value="under_observation">Under Observation</option>
                <option value="recovered">Recovered</option>
                <option value="discharged">Discharged</option>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddPatientModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingPat}>
                {isSubmittingPat ? "Enrolling..." : "Confirm Enrollment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
