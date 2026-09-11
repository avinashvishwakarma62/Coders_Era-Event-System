const express = require("express");
const pool = require("../db/database");

const {
    createRegistration
} = require("../controllers/registrationController");

const router = express.Router();

console.log(">>> registrationRoutes.js LOADED");

// =====================================
// GET EVENTS FOR PUBLIC REGISTRATION
// =====================================

router.get("/events", async (req, res) => {

    console.log(">>> GET /api/registrations/events HIT");

    try {

        const result = await pool.query(`
            SELECT
                id,
                title,
                description,
                event_date,
                start_time,
                end_time,
                venue,
                registration_open
            FROM events
            WHERE registration_open = TRUE
            ORDER BY event_date ASC, start_time ASC
        `);

        console.log(
            ">>> Events found:",
            result.rows.length
        );

        return res.status(200).json({
            message: "Events fetched successfully",
            events: result.rows
        });

    } catch (error) {

        console.error(
            ">>> Registration events error:",
            error
        );

        return res.status(500).json({
            message: "Failed to load events",
            error: error.message
        });
    }
});


// =====================================
// CREATE REGISTRATION
// =====================================

router.post("/", createRegistration);


// =====================================
// TEST ROUTE
// =====================================

router.get("/test", (req, res) => {

    console.log(">>> REGISTRATION TEST ROUTE HIT");

    res.json({
        message: "Registration routes are working"
    });

});


// =====================================
// EXPORT
// =====================================

module.exports = router;