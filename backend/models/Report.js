// backend/models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'summary', // example: 'students', 'teachers', 'finance'
  },
  filters: {
    type: Object,
    default: {}, // filter conditions (date range, class etc)
  },
  generatedBy: {
    type: String,
    default: 'Admin', // who generated report
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  fileName: {
    type: String,
  },
  filePath: {
    type: String,
  },
  meta: {
    type: Object,
    default: {}, // additional data like totals, counts
  },
});

// Export the model
module.exports = mongoose.model('Report', ReportSchema);
