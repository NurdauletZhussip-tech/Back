const ProgressService = require('../services/progressService');

exports.getChildProgress = async (req, res) => {
  try {
    const { childId } = req.params;
    const result = await ProgressService.getChildProgress(childId, req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChildDashboard = async (req, res) => {
  try {
    const { childId } = req.params;
    const result = await ProgressService.getChildDashboard(childId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};