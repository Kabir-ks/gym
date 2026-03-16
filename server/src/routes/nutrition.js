import express from "express";
import db from "../models/db.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// Calculate nutrition plan
router.post("/calculate", (req, res) => {
  const { age, weight, height, activity_level, goal, gender } = req.body;

  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  let tdee = bmr * (activityMultipliers[activity_level] || 1.2);

  // Adjust for goal
  let calories;
  if (goal === "weight_loss") {
    calories = Math.round(tdee - 500);
  } else if (goal === "muscle_gain") {
    calories = Math.round(tdee + 300);
  } else {
    calories = Math.round(tdee);
  }

  // Calculate macros
  const protein = goal === "muscle_gain" ? weight * 2.2 : weight * 1.8;
  const fats = (calories * 0.25) / 9;
  const carbs = (calories - (protein * 4 + fats * 9)) / 4;

  const plan = {
    calculated_calories: calories,
    protein_grams: Math.round(protein),
    carbs_grams: Math.round(carbs),
    fats_grams: Math.round(fats),
  };

  res.json(plan);
});

// Save nutrition plan
router.post("/save", authenticateAdmin, (req, res) => {
  const {
    user_type,
    user_id,
    name,
    age,
    weight,
    height,
    activity_level,
    goal,
    calculated_calories,
    protein_grams,
    carbs_grams,
    fats_grams,
  } = req.body;

  const result = db
    .prepare(
      `
    INSERT INTO nutrition_plans (user_type, user_id, name, age, weight, height, activity_level, goal, calculated_calories, protein_grams, carbs_grams, fats_grams)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    )
    .run(
      user_type,
      user_id,
      name,
      age,
      weight,
      height,
      activity_level,
      goal,
      calculated_calories,
      protein_grams,
      carbs_grams,
      fats_grams,
    );

  const plan = db
    .prepare("SELECT * FROM nutrition_plans WHERE id = ?")
    .get(result.lastInsertRowid);
  res.json(plan);
});

// Get saved plans
router.get("/plans", authenticateAdmin, (req, res) => {
  const plans = db
    .prepare(
      `
    SELECT * FROM nutrition_plans
    ORDER BY created_at DESC
  `,
    )
    .all();

  res.json(plans);
});

export default router;
