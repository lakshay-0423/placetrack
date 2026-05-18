const Job = require("../models/Job");
const Application = require("../models/Application");
const Company = require("../models/Company");
const prisma = require("../config/prismaClient");

/**
 * Sync placement report data from MongoDB into the PostgreSQL
 * `placement_reports` table via Prisma.
 * Each company + year combination becomes one row (upserted).
 */
exports.syncPlacementReports = async () => {
  const companies = await Company.find({ isDeleted: { $ne: true } });
  let synced = 0;

  for (const company of companies) {
    const jobs = await Job.find({
      company: company._id,
      isDeleted: { $ne: true },
    });

    if (jobs.length === 0) continue;

    const hiringYear =
      jobs[0].passingYear || new Date(jobs[0].createdAt).getFullYear();

    const jobIds = jobs.map((j) => j._id);

    const acceptedApps = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
      isDeleted: { $ne: true },
    });

    const studentsSelected = acceptedApps;

    // Calculate packages from ALL jobs offered by this company (salary is on Job, not Application)
    const salaries = jobs
      .map((j) => j.salary || 0)
      .filter((s) => s > 0);

    const averagePackage =
      salaries.length > 0
        ? salaries.reduce((a, b) => a + b, 0) / salaries.length
        : 0;
    const highestPackage = salaries.length > 0 ? Math.max(...salaries) : 0;

    await prisma.placementReport.upsert({
      where: {
        placement_reports_uq: {
          companyMongoId: company._id.toString(),
          hiringYear,
        },
      },
      update: {
        companyName: company.name,
        jobsOffered: jobs.length,
        studentsSelected,
        averagePackage,
        highestPackage,
        createdAt: new Date(),
      },
      create: {
        companyName: company.name,
        companyMongoId: company._id.toString(),
        hiringYear,
        jobsOffered: jobs.length,
        studentsSelected,
        averagePackage,
        highestPackage,
      },
    });

    synced++;
  }

  return synced;
};

/**
 * Sync per-company applicant / shortlisted / accepted counts into the
 * `company_analytics` table via Prisma.
 */
exports.syncCompanyAnalytics = async () => {
  const companies = await Company.find({ isDeleted: { $ne: true } });
  let synced = 0;

  for (const company of companies) {
    const jobs = await Job.find({
      company: company._id,
      isDeleted: { $ne: true },
    });

    if (jobs.length === 0) continue;

    const hiringYear =
      jobs[0].passingYear || new Date(jobs[0].createdAt).getFullYear();
    const jobIds = jobs.map((j) => j._id);

    const totalApplicants = await Application.countDocuments({
      job: { $in: jobIds },
      isDeleted: { $ne: true },
    });

    const accepted = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
      isDeleted: { $ne: true },
    });

    const shortlisted = await Application.countDocuments({
      job: { $in: jobIds },
      status: { $ne: "Rejected" },
      isDeleted: { $ne: true },
    });

    await prisma.companyAnalytics.upsert({
      where: {
        company_analytics_uq: {
          companyMongoId: company._id.toString(),
          hiringYear,
        },
      },
      update: {
        companyName: company.name,
        totalApplicants,
        shortlisted,
        accepted,
        updatedAt: new Date(),
      },
      create: {
        companyName: company.name,
        companyMongoId: company._id.toString(),
        totalApplicants,
        shortlisted,
        accepted,
        hiringYear,
      },
    });

    synced++;
  }

  return synced;
};
