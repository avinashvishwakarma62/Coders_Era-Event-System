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

    const client = await pool.connect();

    try {

        const {
            event_id,
            name,
            email,
            phone,
            roll_no,
            college_email,
            host_institution,
            degree,
            branch,
            year_of_study
        } = req.body;


        // =====================================
        // VALIDATION
        // =====================================

        if (
            !event_id ||
            !name ||
            !email ||
            !roll_no ||
            !college_email ||
            !phone ||
            !host_institution ||
            !degree ||
            !branch ||
            !year_of_study
        ) {

            return res.status(400).json({
                message: "All registration fields are required"
            });

        }


        // =====================================
        // CHECK EVENT
        // =====================================

        const event = await client.query(
            "SELECT * FROM events WHERE id = $1",
            [event_id]
        );


        if (event.rows.length === 0) {

            return res.status(404).json({
                message: "Event not found"
            });

        }


        // =====================================
        // CHECK REGISTRATION STATUS
        // =====================================

        if (!event.rows[0].registration_open) {

            return res.status(400).json({
                message: "Registration is closed"
            });

        }


        // =====================================
        // START TRANSACTION
        // =====================================

        await client.query("BEGIN");


        // =====================================
        // GENERATE REGISTRATION ID
        // =====================================

        const registrationId =
            generateRegistrationId();


        // =====================================
        // SAVE REGISTRATION
        // =====================================

        const result = await client.query(

            `INSERT INTO registrations
            (
                event_id,
                name,
                email,
                phone,
                registration_id,
                roll_no,
                college_email,
                host_institution,
                degree,
                branch,
                year_of_study
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11
            )
            RETURNING *`,

            [
                event_id,
                name,
                email,              // ✅ FIXED
                phone,
                registrationId,
                roll_no,
                college_email,
                host_institution,
                degree,
                branch,
                year_of_study
            ]

        );


        const registration =
            result.rows[0];


        // =====================================
        // GENERATE TICKET CODE
        // =====================================

        const ticketCode =
            generateTicketCode();


        // =====================================
        // GENERATE QR CODE
        // =====================================

        const qrCode =
            await generateQRCode(ticketCode);


        // =====================================
        // CHECK QR
        // =====================================

        if (!qrCode) {

            throw new Error(
                "QR code generation failed"
            );

        }


        // =====================================
        // SAVE TICKET
        // =====================================

        const ticketResult = await client.query(

            `INSERT INTO tickets
            (
                registration_id,
                ticket_code,
                qr_data
            )
            VALUES
            (
                $1,
                $2,
                $3
            )
            RETURNING *`,

            [
                registration.id,
                ticketCode,
                qrCode
            ]

        );


        const ticket =
            ticketResult.rows[0];


        // =====================================
        // COMMIT TRANSACTION
        // =====================================

        await client.query("COMMIT");


        // =====================================
        // SUCCESS RESPONSE
        // =====================================

        res.status(201).json({

            message: "Registration successful",

            registration: registration,

            ticket: {

                id: ticket.id,

                ticket_code: ticket.ticket_code,

                qr_data: ticket.qr_data

            },

            ticket_url:
                `ticket.html?ticketCode=${encodeURIComponent(ticketCode)}`

        });


    } catch (error) {

        // =====================================
        // ROLLBACK
        // =====================================

        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error(
                "Rollback error:",
                rollbackError.message
            );
        }


        console.error(
            "Registration error:",
            error
        );


        res.status(500).json({

            message: "Registration failed",

            error: error.message

        });


    } finally {

        // =====================================
        // RELEASE DATABASE CONNECTION
        // =====================================

        client.release();

    }
};


// =====================================
// EXPORT
// =====================================

module.exports = {
    createRegistration
};