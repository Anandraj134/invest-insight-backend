const supabase = require('../config/supabaseConfig');
const jwt = require('jsonwebtoken');

async function signUp(req, res) {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(400).json({ message: error.message });
  }
  res.status(201).json({ data });
}

async function signIn(req, res) {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })

  console.log(data);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  res.status(200).json({ data });
}

async function refreshToken(req, res) {
  const { refresh_token } = req.body;
  const { data, error } = await supabase.auth.refreshSession({ refresh_token })
  const { session, user } = data

  console.log(session);
  console.log(user);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  res.status(200).json({ data });
}

module.exports = { signUp, signIn, refreshToken };
