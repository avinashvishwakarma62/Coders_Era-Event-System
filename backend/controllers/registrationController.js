const pool = require("../db/database");

const {
    generateRegistrationId,
    generateTicketCode
} = require("../utils/idGenerator");

const generateQRCode = require("../utils/qrGenerator");


// =====================================
// CREATE REGISTRATION
// =====================================

const createRegistration = async (req, res) => {

    try {

        const {
            event_id,
            name,
            email,
            phone
        } = req.body;


        // =====================================
        // Check Event
        // =====================================

        const event = await pool.query(
            "SELECT * FROM events WHERE id = $1",
            [event_id]
        );

        if (event.rows.length === 0) {

            return res.status(404).json({
                message: "Event not found"
            });
        }


        // =====================================
        // Check Registration Status
        // =====================================

        if (!event.rows[0].registration_open) {

            return res.status(400).json({
                message: "Registration is closed"
            });
        }


        // =====================================
        // Generate Registration ID
        // =====================================

        const registrationId =
            generateRegistrationId();


        // =====================================
        // Save Registration
        // =====================================

        const result = await pool.query(

            `INSERT INTO registrations
            (
                event_id,
                name,
                email,
                phone,
                registration_id
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,

            [
                event_id,
                name,
                email,
                phone,
                registrationId
            ]
        );


        const registration =
            result.rows[0];


        // =====================================
        // Generate Ticket
        // =====================================

        const ticketCode =
            generateTicketCode();


        // =====================================
        // Generate QR Code
        // =====================================

        const qrCode =
            await generateQRCode(ticketCode);


        // =====================================
        // Save Ticket
        // =====================================

        await pool.query(

            `INSERT INTO tickets
            (
                registration_id,
                ticket_code,
                qr_data
            )
            VALUES ($1, $2, $3)`,

            [
                registration.id,
                ticketCode,
                qrCode
            ]
        );


        // =====================================
        // SUCCESS RESPONSE
        // =====================================

        res.status(201).json({

            message: "Registration successful",

            registration: registration,

            ticket: {

                ticket_code: ticketCode,

                qr_data: qrCode

            },

            // Dynamic ticket page URL
            ticket_url:
                `ticket.html?ticketCode=${encodeURIComponent(ticketCode)}`
        });


    } catch (error) {

        console.error(
            "Registration error:",
            error.message
        );


        res.status(500).json({

            message: "Registration failed",

            error: error.message

        });

    }
};


// =====================================
// EXPORT
// =====================================

module.exports = {

    createRegistration

};