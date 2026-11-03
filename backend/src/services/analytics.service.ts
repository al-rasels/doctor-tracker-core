import mongoose from "mongoose";
import { Doctor } from "../models/doctor.model.js";
import { Patient } from "../models/patient.model.js";

export interface DashboardMetrics {
  kpis: {
    totalDoctors: number;
    totalPatients: number;
    admittedPatients: number;
    underObservationPatients: number;
    recoveredPatients: number;
    dischargedPatients: number;
    averagePatientsPerDoctor: number;
  };
  patientsPerDoctor: Array<{
    doctorId: string;
    doctorName: string;
    specialization: string;
    patientCount: number;
  }>;
  admissionTimeline: Array<{
    date: string;
    count: number;
  }>;
  conditionDistribution: Array<{
    condition: string;
    count: number;
  }>;
}

export class AnalyticsService {
  static async getDashboardMetrics(timeframe = "30d"): Promise<DashboardMetrics> {
    const totalDoctors = await Doctor.countDocuments();

    // Determine timeframe date boundary for timeline stats
    let startDate: Date | null = new Date();
    if (timeframe === "7d") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === "30d") {
      startDate.setDate(startDate.getDate() - 30);
    } else if (timeframe === "90d") {
      startDate.setDate(startDate.getDate() - 90);
    } else {
      startDate = null; // all time
    }

    const timelineMatch: Record<string, any> = {};
    if (startDate) {
      timelineMatch.admissionDate = { $gte: startDate };
    }

    // Execute single-trip multi-facet aggregation pipeline on patients collection
    const [patientAggregation] = await Patient.aggregate([
      {
        $facet: {
          kpiStatusTotals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                admitted: {
                  $sum: { $cond: [{ $eq: ["$status", "admitted"] }, 1, 0] }
                },
                underObservation: {
                  $sum: { $cond: [{ $eq: ["$status", "under_observation"] }, 1, 0] }
                },
                recovered: {
                  $sum: { $cond: [{ $eq: ["$status", "recovered"] }, 1, 0] }
                },
                discharged: {
                  $sum: { $cond: [{ $eq: ["$status", "discharged"] }, 1, 0] }
                }
              }
            }
          ],
          patientsPerDoctor: [
            {
              $group: {
                _id: "$doctorId",
                patientCount: { $sum: 1 }
              }
            },
            {
              $lookup: {
                from: "doctors",
                localField: "_id",
                foreignField: "_id",
                as: "doctor"
              }
            },
            { $unwind: "$doctor" },
            {
              $project: {
                doctorId: "$_id",
                doctorName: "$doctor.name",
                specialization: "$doctor.specialization",
                patientCount: 1,
                _id: 0
              }
            },
            { $sort: { patientCount: -1 } },
            { $limit: 10 }
          ],
          admissionTimeline: [
            ...(startDate ? [{ $match: timelineMatch }] : []),
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$admissionDate" }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                date: "$_id",
                count: 1,
                _id: 0
              }
            }
          ],
          conditionDistribution: [
            {
              $group: {
                _id: "$condition",
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
              $project: {
                condition: "$_id",
                count: 1,
                _id: 0
              }
            }
          ]
        }
      }
    ]);

    const kpiSummary = patientAggregation?.kpiStatusTotals?.[0] || {
      total: 0,
      admitted: 0,
      underObservation: 0,
      recovered: 0,
      discharged: 0
    };

    const totalPatients = kpiSummary.total || 0;
    const averagePatientsPerDoctor =
      totalDoctors > 0 ? Number((totalPatients / totalDoctors).toFixed(2)) : 0;

    return {
      kpis: {
        totalDoctors,
        totalPatients,
        admittedPatients: kpiSummary.admitted,
        underObservationPatients: kpiSummary.underObservation,
        recoveredPatients: kpiSummary.recovered,
        dischargedPatients: kpiSummary.discharged,
        averagePatientsPerDoctor
      },
      patientsPerDoctor: patientAggregation?.patientsPerDoctor || [],
      admissionTimeline: patientAggregation?.admissionTimeline || [],
      conditionDistribution: patientAggregation?.conditionDistribution || []
    };
  }
}
