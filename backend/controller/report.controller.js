'use strict';

const asyncHandler = require('../util/asyncHandler');
const { paginationMeta } = require('../util/pagination');
const reportService = require('../service/report.service');

const createReport = asyncHandler(async (req, res) => {
  const result = await reportService.createReport({
    user: req.user,
    payload: req.validated.body,
  });
  res.status(201).json({ data: result });
});

const getReport = asyncHandler(async (req, res) => {
  const report = await reportService.getReport({
    reportId: req.validated.params.id,
    user: req.user,
  });
  res.status(200).json({ data: report });
});

const listMyReports = asyncHandler(async (req, res) => {
  const { page, limit } = req.validated.query;
  const { reports, total } = await reportService.listMyReports({
    user: req.user,
    page,
    limit,
  });

  res.status(200).json({
    data: reports,
    meta: paginationMeta({ page, limit, total }),
  });
});

module.exports = {
  createReport,
  getReport,
  listMyReports,
};
