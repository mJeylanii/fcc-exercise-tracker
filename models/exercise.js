const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  userId: { type: String, require: true },
  description: { type: String, require: true },
  duration: { type: Number, require: true },
  date: { type: Date, require: true },
});

module.exports = mongoose.model("Exercise", exerciseSchema);
