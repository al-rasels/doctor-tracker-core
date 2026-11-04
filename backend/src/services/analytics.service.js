import { Doctor as DefaultDoctor } from "../models/doctor.model.js";
import { Patient as DefaultPatient } from "../models/patient.model.js";

/**
 * Calculates the start date filter based on the chosen timeframe.
 *
 * @param {string} timeframe - '7d', '30d', '90d', or 'all'
 * @returns {Date|null}
 */
const calculateStartDate = (timeframe = "30d") => {
  const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
  const days = daysMap[timeframe];

  if (!days) return null; // 'all' or default all-time

  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Pipeline 1: Count patients grouped by clinical status.
 */
const createStatusCountsPipeline = () => [
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
];

/**
 * Pipeline 2: Count patients assigned per doctor with doctor profile lookup.
 */
const createDoctorWorkloadPipeline = () => [
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
      _id: 0,
      doctorId: "$_id",
      doctorName: "$doctor.name",
      specialization: "$doctor.specialization",
      patientCount: 1
    }
  },
  { $sort: { patientCount: -1 } },
  { $limit: 10 }
];

/**
 * Pipeline 3: Group patient admissions by day for the timeline chart.
 */
const createAdmissionTimelinePipeline = (startDate) => {
  const pipeline = [];

  if (startDate) {
    pipeline.push({
      $match: {
        admissionDate: { $gte: startDate }
      }
    });
  }

  pipeline.push(
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
        _id: 0,
        date: "$_id",
        count: 1
      }
    }
  );

  return pipeline;
};

/**
 * Pipeline 4: Count patients grouped by medical condition / diagnosis.
 */
const createConditionDistributionPipeline = () => [
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
      _id: 0,
      condition: "$_id",
      count: 1
    }
  }
];

/**
 * Retrieves full dashboard analytics in a single database aggregation trip.
 * Models { Doctor, Patient } are passed as parameters from the controller.
 *
 * @param {Object} models - Injected { Doctor, Patient } models
 * @param {string} timeframe - '7d', '30d', '90d', or 'all'
 * @returns {Promise<Object>} Dashboard KPIs and chart datasets
 */
export const getDashboardMetrics = async (models = {}, timeframe = "30d") => {
  // Support both (models, timeframe) and (timeframe)
  let DoctorModel = DefaultDoctor;
  let PatientModel = DefaultPatient;
  let selectedTimeframe = timeframe;

  if (typeof models === "string") {
    selectedTimeframe = models;
  } else if (models && (models.Doctor || models.Patient)) {
    DoctorModel = models.Doctor || DefaultDoctor;
    PatientModel = models.Patient || DefaultPatient;
  }

  // 1. Fetch total doctors count
  const totalDoctors = await DoctorModel.countDocuments();

  // 2. Compute date boundary for timeline
  const startDate = calculateStartDate(selectedTimeframe);

  // 3. Run multi-facet aggregation on Patient collection
  const [aggregationResult] = await PatientModel.aggregate([
    {
      $facet: {
        statusCounts: createStatusCountsPipeline(),
        doctorWorkloads: createDoctorWorkloadPipeline(),
        admissionTimeline: createAdmissionTimelinePipeline(startDate),
        conditionDistribution: createConditionDistributionPipeline()
      }
    }
  ]);

  // 4. Extract status metrics with safe zero fallbacks
  const statusSummary = aggregationResult?.statusCounts?.[0] || {
    total: 0,
    admitted: 0,
    underObservation: 0,
    recovered: 0,
    discharged: 0
  };

  const totalPatients = statusSummary.total;
  const averagePatientsPerDoctor =
    totalDoctors > 0 ? Number((totalPatients / totalDoctors).toFixed(2)) : 0;

  // 5. Return structured dashboard response
  return {
    kpis: {
      totalDoctors,
      totalPatients,
      admittedPatients: statusSummary.admitted,
      underObservationPatients: statusSummary.underObservation,
      recoveredPatients: statusSummary.recovered,
      dischargedPatients: statusSummary.discharged,
      averagePatientsPerDoctor
    },
    patientsPerDoctor: aggregationResult?.doctorWorkloads || [],
    admissionTimeline: aggregationResult?.admissionTimeline || [],
    conditionDistribution: aggregationResult?.conditionDistribution || []
  };
};

export const AnalyticsService = {
  getDashboardMetrics
};
