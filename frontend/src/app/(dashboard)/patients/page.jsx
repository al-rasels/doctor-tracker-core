"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  Filter, 
  Phone, 
  Stethoscope, 
  Check, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Skeleton
} from "@/components/ui";

/**
 * Master Patients Registry Page.
 * Provides multi-parameter search, filtering by clinical status, condition, and admission date,
 * along with responsive data tables, patient update modals, and deletion actions.
 */
export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [condition, setCondition] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Edit patient modal state
  const [editingPatient, setEditingPatient] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    age: 0,
    gender: "male",
    phone: "",
    condition: "",
    status: "admitted"
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete confirmation modal state
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Fetches paginated and filtered patients from the API.
   */
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(status && { status }),
        ...(condition && { condition }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const res = await api.get(`/patients?${params.toString()}`);
      setPatients(res.data.data);
      setTotalPages(res.data.meta?.totalPages || 1);
      setTotalCount(res.data.meta?.total || 0);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, status, condition, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPatients();
  };

  const handleOpenEdit = (patient) => {
    setEditingPatient(patient);
    setEditForm({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      condition: patient.condition,
      status: patient.status
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPatient) return;
    setIsUpdating(true);
    try {
      await api.put(`/patients/${editingPatient._id}`, editForm);
      setEditingPatient(null);
      fetchPatients();
    } catch (err) {
      console.error("Failed to update patient record:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/patients/${patientToDelete._id}`);
      setPatientToDelete(null);
      fetchPatients();
    } catch (err) {
      console.error("Failed to delete patient:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeVariant = (patientStatus) => {
    switch (patientStatus) {
      case "admitted":
        return "warning";
      case "under_observation":
        return "info";
      case "recovered":
        return "success";
      case "discharged":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Master Patients Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Comprehensive patient catalog, clinical presentation, and assigned physicians
          </p>
        </div>
        <Badge variant="info" className="px-3.5 py-1 text-xs font-bold self-start sm:self-auto">
          {totalCount} Active Patient Records
        </Badge>
      </div>

      {/* Advanced Filter Toolbar */}
      <Card className="p-4 sm:p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search patients by name, phone, or condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Admission Status
            </label>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="text-xs font-semibold h-9"
            >
              <option value="">All Statuses</option>
              <option value="admitted">Admitted</option>
              <option value="under_observation">Under Observation</option>
              <option value="recovered">Recovered</option>
              <option value="discharged">Discharged</option>
            </Select>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Clinical Condition
            </label>
            <Input
              type="text"
              placeholder="e.g. Hypertension"
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9"
            />
          </div>

          {/* Date from */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Admitted From
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Admitted To
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            {patients.length} results shown on current page
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatus("");
              setCondition("");
              setStartDate("");
              setEndDate("");
              setPage(1);
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Clear All Filters
          </Button>
        </div>
      </Card>

      {/* Patients Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Information</TableHead>
                <TableHead>Attending Doctor</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <tr>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading patient registry...
                  </TableCell>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    No matching patient records found. Try modifying your search or filter parameters.
                  </TableCell>
                </tr>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient._id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell>
                      <div className="font-bold text-slate-900">{patient.name}</div>
                      <div className="text-xs text-slate-500">
                        {patient.age} yrs • {patient.gender} • {patient.phone}
                      </div>
                    </TableCell>

                    <TableCell>
                      {patient.doctorId ? (
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <Stethoscope className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            <span>{patient.doctorId.name}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {patient.doctorId.specialization}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-slate-800">{patient.condition}</span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(patient.status)}
                        className="capitalize font-semibold"
                      >
                        {patient.status.replace("_", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(patient.admissionDate)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(patient)}
                          className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          title="Edit patient"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPatientToDelete(patient)}
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                          title="Delete patient"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Showing page {page} of {totalPages} ({totalCount} total records)
            </span>
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
      </Card>

      {/* Dialog Modal: Edit Patient Record */}
      <Dialog open={Boolean(editingPatient)} onOpenChange={(open) => !open && setEditingPatient(null)}>
        <DialogContent onClose={() => setEditingPatient(null)}>
          <DialogHeader>
            <DialogTitle>Update Patient Record</DialogTitle>
            <DialogDescription>
              Modify patient clinical diagnostics, contact information, and admission status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Patient Full Name
              </label>
              <Input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gender
                </label>
                <Select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
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
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Diagnostic Condition
              </label>
              <Input
                type="text"
                required
                value={editForm.condition}
                onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admission Status
              </label>
              <Select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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
                onClick={() => setEditingPatient(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Modal: Delete Confirmation */}
      <Dialog open={Boolean(patientToDelete)} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <DialogContent onClose={() => setPatientToDelete(null)}>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Confirm Permanent Deletion</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete patient record for{" "}
              <strong className="text-slate-800">{patientToDelete?.name}</strong>? This action will permanently remove the record and rebalance the doctor's active caseload.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPatientToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
