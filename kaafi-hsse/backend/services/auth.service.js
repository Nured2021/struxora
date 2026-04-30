const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');
const User = require('../models/user.model');

const VALID_ROLES = ['Admin', 'Supervisor', 'Worker'];

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function sanitizeRole(role) {
  if (!role) return 'Worker';
  if (!VALID_ROLES.includes(role)) {
    const error = new Error('Role must be Admin, Supervisor, or Worker');
    error.statusCode = 400;
    throw error;
  }
  return role;
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  };
}

async function register({ email, password, role }) {
  const normalizedEmail = normalizeEmail(email);
  const cleanRole = sanitizeRole(role);

  if (!normalizedEmail || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error('Password must be at least 8 characters');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findByEmail(normalizedEmail);
  if (existingUser) {
    const error = new Error('A user with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    role: cleanRole,
  });

  return {
    user: publicUser(user),
    token: signToken(user),
  };
}

async function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByEmail(normalizedEmail);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return {
    user: publicUser(user),
    token: signToken(user),
  };
}

module.exports = {
  register,
  login,
};
