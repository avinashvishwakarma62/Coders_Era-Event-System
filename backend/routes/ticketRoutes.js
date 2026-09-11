const express = require("express");
const pool = require("../db/database");

const router = express.Router();

// =====================================
// GET TICKET DETAILS
// =====================================

router.get("/:ticketCode", async (req, res) => {
    try {
        const ticketCode = decodeURIComponent(
            req.params.ticketCode
        ).trim();

        if (!ticketCode) {
            return res.status(400).json({
                message: "Ticket code is required"
            });
        }

        // =====================================
        // FETCH TICKET + REGISTRATION + EVENT
        // =====================================

        const result = await pool.query(
            `
            SELECT
                t.id AS ticket_id,
                t.ticket_code,
                t.qr_data,
                t.checked_in,
                t.checked_in_at,

                r.id AS registration_id,
                r.registration_id AS registration_code,

                r.name,
                r.email,
                r.phone,

                r.roll_no,
                r.college_email,
                r.host_institution,
                r.degree,
                r.branch,
                r.year_of_study,

                r.registered_at,

                e.id AS event_id,
                e.title AS event_title,
                e.description,
                e.event_date,
                e.start_time,
                e.end_time,
                e.venue

            FROM tickets t

            LEFT JOIN registrations r
                ON t.registration_id = r.id

            LEFT JOIN events e
                ON r.event_id = e.id

            WHERE LOWER(TRIM(t.ticket_code)) =
                  LOWER(TRIM($1))

            LIMIT 1
            `,
            [ticketCode]
        );

        // =====================================
        // TICKET NOT FOUND
        // =====================================

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Ticket not found",
                searchedCode: ticketCode
            });
        }

        // =====================================
        // SUCCESS
        // =====================================

        res.status(200).json({
            message: "Ticket fetched successfully",
            ticket: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Ticket API Error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch ticket",
            error: error.message
        });
    }
});

module.exports = router;