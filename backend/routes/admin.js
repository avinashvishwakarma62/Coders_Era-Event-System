const express = require("express");
const pool = require("../db/database");

const router = express.Router();

// =====================================
// GET ALL EVENTS
// =====================================
router.get("/events", async (req, res) => {
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
            ORDER BY event_date ASC, start_time ASC
        `);

        res.status(200).json({
            message: "Events fetched successfully",
            events: result.rows
        });

    } catch (error) {
        console.error("Admin events error:", error);

        res.status(500).json({
            message: "Failed to load events",
            error: error.message
        });
    }
});


// =====================================
// GET ATTENDANCE FOR EVENT
// =====================================
router.get("/attendance/:eventId", async (req, res) => {
    try {
        const eventId = req.params.eventId;

        const result = await pool.query(
            `
            SELECT
                COUNT(r.id)::int AS total_registrations,
                COUNT(t.id) FILTER (
                    WHERE t.checked_in = TRUE
                )::int AS checked_in
            FROM registrations r
            LEFT JOIN tickets t
                ON t.registration_id = r.id
            WHERE r.event_id = $1
            `,
            [eventId]
        );

        const totalRegistrations =
            result.rows[0].total_registrations || 0;

        const checkedIn =
            result.rows[0].checked_in || 0;

        const notCheckedIn =
            totalRegistrations - checkedIn;

        const attendancePercentage =
            totalRegistrations > 0
                ? `${((checkedIn / totalRegistrations) * 100).toFixed(2)}%`
                : "0%";

        res.status(200).json({
            message: "Attendance fetched successfully",
            attendance: {
                totalRegistrations,
                checkedIn,
                notCheckedIn,
                attendancePercentage
            }
        });

    } catch (error) {
        console.error("Attendance error:", error);

        res.status(500).json({
            message: "Failed to load attendance",
            error: error.message
        });
    }
});


// =====================================
// GET ALL REGISTRATIONS
// =====================================
router.get("/registrations", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                r.id,
                r.event_id,
                r.name,
                r.email,
                r.phone,
                r.registration_id,
                r.registered_at,

                e.title AS event_title,

                t.ticket_code,
                t.checked_in,
                t.checked_in_at

            FROM registrations r

            LEFT JOIN events e
                ON r.event_id = e.id

            LEFT JOIN tickets t
                ON t.registration_id = r.id

            ORDER BY r.registered_at DESC
        `);

        res.status(200).json({
            message: "Registrations fetched successfully",
            registrations: result.rows
        });

    } catch (error) {
        console.error("Admin registrations error:", error);

        res.status(500).json({
            message: "Failed to load registrations",
            error: error.message
        });
    }
});


// =====================================
// GET SINGLE REGISTRATION
// =====================================
router.get("/registrations/:id", async (req, res) => {
    try {
        const registrationId = req.params.id;

        const result = await pool.query(
            `
            SELECT
                r.id,
                r.event_id,
                r.name,
                r.email,
                r.phone,
                r.registration_id,
                r.registered_at,

                e.title AS event_title,

                t.ticket_code,
                t.checked_in,
                t.checked_in_at

            FROM registrations r

            LEFT JOIN events e
                ON r.event_id = e.id

            LEFT JOIN tickets t
                ON t.registration_id = r.id

            WHERE r.id = $1
            `,
            [registrationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Registration not found"
            });
        }

        res.status(200).json({
            message: "Registration fetched successfully",
            registration: result.rows[0]
        });

    } catch (error) {
        console.error("Single registration error:", error);

        res.status(500).json({
            message: "Failed to load registration",
            error: error.message
        });
    }
});


// =====================================
// EXPORT ROUTER
// =====================================

module.exports = router;