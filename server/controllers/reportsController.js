const prisma = require("../config/prismaClient");
const Application = require("../models/Application");
const Job = require("../models/Job");
const Student = require("../models/Student");
const Company = require("../models/Company");
const { calculateScore } = require("../utils/candidateScoring");
const {
  syncPlacementReports,
  syncCompanyAnalytics,
} = require("../services/analyticsSyncService");

/**
 * GET /admin/reports — Analytics Dashboard
 */
exports.analyticsDashboard = async (req, res, next) => {
  try {
    const reports = await prisma.placementReport.findMany({
      orderBy: { hiringYear: "desc" },
    });

    // Aggregate totals
    const totalPlacements = reports.reduce(
      (sum, r) => sum + r.studentsSelected,
      0
    );
    const totalJobs = reports.reduce((sum, r) => sum + r.jobsOffered, 0);
    const avgPackage =
      reports.length > 0
        ? (
            reports.reduce(
              (sum, r) => sum + parseFloat(r.averagePackage || 0),
              0
            ) / reports.length
          ).toFixed(2)
        : "0.00";
    const highestPackage =
      reports.length > 0
        ? Math.max(...reports.map((r) => parseFloat(r.highestPackage || 0)))
        : 0;
    const totalRecruiters = new Set(reports.map((r) => r.companyMongoId)).size;
    const placementRate =
      totalJobs > 0 ? ((totalPlacements / totalJobs) * 100).toFixed(1) : "0.0";

    res.render("analytics-dashboard", {
      title: "Analytics Dashboard",
      totalPlacements,
      totalJobs,
      avgPackage,
      highestPackage,
      totalRecruiters,
      placementRate,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/leaderboard — Student Leaderboard
 */
exports.leaderboard = async (req, res, next) => {
  try {
    const students = await Student.find({ isDeleted: { $ne: true } });
    const jobs = await Job.find({ isDeleted: { $ne: true } });

    // Calculate placement score for each student against first available job
    // or a synthetic job with all skills
    const allSkills = [...new Set(jobs.flatMap((j) => j.requiredSkills || []))];
    const syntheticJob = { requiredSkills: allSkills };

    const scoredStudents = students
      .map((s) => ({
        name: s.name,
        email: s.email,
        branch: s.branch || "N/A",
        cgpa: s.cgpa || 0,
        skills: s.skills || [],
        experience: s.experience || 0,
        score: calculateScore(s, syntheticJob),
      }))
      .sort((a, b) => b.score - a.score);

    res.render("leaderboard", {
      title: "Student Leaderboard",
      students: scoredStudents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/company-history — Company Hiring History
 */
exports.companyHistory = async (req, res, next) => {
  try {
    const reports = await prisma.placementReport.findMany({
      orderBy: [{ hiringYear: "desc" }, { companyName: "asc" }],
    });

    res.render("company-history", {
      title: "Company Hiring History",
      reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/company-analytics — Per-company Analytics
 */
exports.companyAnalytics = async (req, res, next) => {
  try {
    const analytics = await prisma.companyAnalytics.findMany({
      orderBy: [{ hiringYear: "desc" }, { companyName: "asc" }],
    });

    res.render("company-analytics", {
      title: "Company Analytics",
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/reports/sync — Trigger data sync from MongoDB → PostgreSQL
 */
exports.syncData = async (req, res, next) => {
  try {
    const reportsSynced = await syncPlacementReports();
    const analyticsSynced = await syncCompanyAnalytics();

    res.json({
      message: "Sync complete",
      reportsSynced,
      analyticsSynced,
    });
  } catch (error) {
    next(error);
  }
};
