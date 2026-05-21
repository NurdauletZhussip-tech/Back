const ProgressService = require('../services/progressService');
const asyncHandler = require('../middleware/asyncHandler');

exports.getChildProgress = asyncHandler(async (req, res) => {
  const { childId } = req.params;
  const result = await ProgressService.getChildProgress(childId, req.query);
  res.json(result);
});

exports.getChildDashboard = asyncHandler(async (req, res) => {
  const { childId } = req.params;
  const result = await ProgressService.getChildDashboard(childId);
  res.json(result);
});
