const express = require("express");
const cors = require("cors");

const pool = require("./db/database");

const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");

const registrationRoutes = require("./routes/registrationRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

const app = express();

const PORT = 5000;

// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());
app.use(express.json());

// =====================================
// BASIC TEST
// =====================================

app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Backend and PostgreSQL connected successfully!",
            databaseTime: result.rows[0].now
        });

    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

// =====================================
// AUTH ROUTES
// =====================================

app.use("/api/auth", authRoutes);

// =====================================
// PUBLIC REGISTRATION ROUTES
// =====================================

app.use("/api/registrations", registrationRoutes);

console.log(">>> Registration routes mounted at /api/registrations");

// =====================================
// TICKET ROUTES
// =====================================

app.use("/api/tickets", ticketRoutes);

// =====================================
// ADMIN ROUTES
// =====================================

app.use(
    "/api/admin",
    authMiddleware,
    adminRoutes
);

// =====================================
// CHECK-IN API
// =====================================

app.post("/api/checkin", async (req, res) => {
    try {
        const { ticket_code } = req.body;

        if (!ticket_code) {
            return res.status(400).json({
                message: "Ticket code is required"
            });
        }

        const result = await pool.query(
            `
            UPDATE tickets
            SET
                checked_in = TRUE,
                checked_in_at = CURRENT_TIMESTAMP
            WHERE ticket_code = $1
              AND checked_in = FALSE
            RETURNING *
            `,
            [ticket_code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message:
                    "Invalid ticket or ticket already checked in"
            });
        }

        res.status(200).json({
            message: "Check-in successful",
            ticket: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Check-in error:",
            error.message
        );

        res.status(500).json({
            message: "Check-in failed",
            error: error.message
        });
    }
});

// =====================================
// QR CODE API
// =====================================

app.get("/api/tickets/:ticketCode/qr", async (req, res) => {
    try {
        const { ticketCode } = req.params;

        const result = await pool.query(
            `
            SELECT qr_data
            FROM tickets
            WHERE ticket_code = $1
            `,
            [ticketCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Ticket not found",
                searchedCode: ticketCode
            });
        }

        res.status(200).json({
            message: "QR fetched successfully",
            qr_data: result.rows[0].qr_data
        });

    } catch (error) {
        console.error(
            "QR fetch error:",
            error.message
        );

        res.status(500).json({
            message: "Failed to fetch QR",
            error: error.message
        });
    }
});

// =====================================
// TEST TICKET
// =====================================

app.get("/api/test-ticket/:code", async (req, res) => {
    try {
        const { code } = req.params;

        const result = await pool.query(
            `
            SELECT
                current_database() AS database_name,
                id,
                ticket_code,
                registration_id,
                checked_in,
                checked_in_at
            FROM tickets
            WHERE ticket_code = $1
            `,
            [code]
        );

        res.status(200).json({
            searchedCode: code,
            database:
                result.rows[0]?.database_name ||
                "No result",
            rows: result.rows
        });

    } catch (error) {
        console.error(
            "Test ticket error:",
            error.message
        );

        res.status(500).json({
            error: error.message
        });
    }
});

// =====================================
// DEBUG TICKETS
// =====================================

app.get("/api/debug-tickets", async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                current_database() AS database_name,
                current_user AS db_user,
                inet_server_addr() AS server_address,
                inet_server_port() AS server_port,
                id,
                ticket_code,
                registration_id,
                checked_in,
                checked_in_at
            FROM tickets
            ORDER BY id
            `
        );

        res.status(200).json({
            database:
                result.rows[0]?.database_name || null,

            user:
                result.rows[0]?.db_user || null,

            server:
                result.rows[0]?.server_address || null,

            port:
                result.rows[0]?.server_port || null,

            tickets: result.rows
        });

    } catch (error) {
        console.error(
            "Debug tickets error:",
            error.message
        );

        res.status(500).json({
            message: "Debug failed",
            error: error.message
        });
    }
});

// =====================================
// TEST DATABASE
// =====================================

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                current_database() AS database,
                current_user AS user,
                NOW() AS time
            `
        );

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(
            "Database test error:",
            error.message
        );

        res.status(500).json({
            message: "Database test failed",
            error: error.message
        });
    }
});

// =====================================
// 404 HANDLER
// =====================================

app.use((req, res) => {
    console.log(
        ">>> 404:",
        req.method,
        req.originalUrl
    );

    res.status(404).json({
        message: "API endpoint not found",
        path: req.originalUrl
    });
});

// =====================================
// GLOBAL ERROR HANDLER
// =====================================

app.use((error, req, res, next) => {
    console.error(
        "Global error:",
        error
    );

    res.status(500).json({
        message: "Internal server error"
    });
});

// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});