const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: { type: String, unique: true, sparse: true, trim: true },
  password: { type: String, minlength: 6 },
  authProvider: { type: String, enum: ["local", "google"], default: "local" },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  addresses: [
    {
      label: { type: String, default: "Home" },
      address: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const bcrypt = require("bcryptjs");
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  const bcrypt = require("bcryptjs");
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
