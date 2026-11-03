const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("../config/connection");
const { v4: uuidv4 } = require("uuid");
const { Users } = require("../models");
const { Op, UniqueConstraintError } = require("sequelize");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

async function register(req, res) {
  try {
    const { password, role } = req.body;
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!username || !email || !password || !role || typeof role !== "string") {
      return res.status(400).json({
        success: false,
        message: "Username, email, password, and role are required",
      });
    }

    const ALLOWED_ROLES = ["sharer", "supporter"];
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Roles must be one of: : ${ALLOWED_ROLES.join(", ")}`,
      });
    }

    if (username.length < 4 || password.length < 5) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be at least 4 characters and Password at least 5 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const newUser = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      role,
    };

    await Users.create(newUser);

    const safeUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    };

    return res.status(201).json({
      success: true,
      data: safeUser,
      message: "User Registered successfully",
    });
  } catch (error) {
    req.log.error({ err: error }, "Registration Error");

    if (error instanceof UniqueConstraintError) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

async function login(req, res) {
  try {
    const { password } = req.body;
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await Users.findOne({
      where: { email },
      attributes: ["id", "username", "email", "password", "role", "lastLogin"],
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    await Users.update({ lastLogin: new Date() }, { where: { id: user.id } });

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.role,
      time: Date.now(),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    return res.status(200).json({
      success: true,
      token,
      user: payload,
      message: "User Login successfully",
    });
  } catch (error) {
    req.log.error({ err: error }, "Login Error");

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

async function getSupporters(req, res) {
  try {
    const supporters = await Users.findAll({
      where: {
        role: "supporter",
      },
      attributes: ["id", "username", "email"],
    });

    return res.status(200).json({
      success: true,
      data: supporters,
      message: "Supporters retrieved successfully",
    });
  } catch (error) {
    req.log.error({ err: error }, "Get Supporters Error");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  register,
  login,
  getSupporters,
};
