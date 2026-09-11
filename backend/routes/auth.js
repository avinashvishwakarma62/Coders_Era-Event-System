const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/database");

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const result = await pool.query(
            "SELECT * FROM admins WHERE username = $1 LIMIT 1",
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const admin = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            admin.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                username: admin.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

module.exports = router;