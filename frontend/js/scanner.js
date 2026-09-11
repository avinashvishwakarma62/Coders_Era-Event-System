const API_URL = "http://localhost:5000";

let isProcessing = false;

// =====================================
// SHOW RESULT
// =====================================

function showResult(message, type) {
    const resultBox = document.getElementById("result");

    resultBox.className = type;
    resultBox.innerHTML = message;
    resultBox.style.display = "block";
}

// =====================================
// QR SCAN SUCCESS
// =====================================

async function onScanSuccess(decodedText) {

    if (isProcessing) {
        return;
    }

    isProcessing = true;

    const ticketCode = decodedText.trim();

    console.log("=================================");
    console.log("QR SCANNED");
    console.log("Ticket Code:", ticketCode);
    console.log("=================================");

    showResult(
        "🔍 Verifying ticket...",
        "info"
    );

    try {

        // =====================================
        // STEP 1: VERIFY TICKET
        // =====================================

        const ticketResponse = await fetch(
            `${API_URL}/api/tickets/${encodeURIComponent(ticketCode)}`
        );

        const ticketData = await ticketResponse.json();

        console.log("Ticket Response:", ticketData);

        if (!ticketResponse.ok) {

            throw new Error(
                ticketData.message || "Ticket not found"
            );
        }

        const ticket = ticketData.ticket;

        // =====================================
        // ALREADY CHECKED IN
        // =====================================

        if (ticket.checked_in) {

            showResult(
                `
                ❌ <strong>Already Checked In</strong><br><br>

                <strong>Name:</strong>
                ${ticket.name || "N/A"}<br>

                <strong>Ticket:</strong>
                ${ticket.ticket_code || "N/A"}<br>

                <strong>Event:</strong>
                ${ticket.event_title || "N/A"}<br><br>

                <strong>Check-in Time:</strong>
                ${ticket.checked_in_at
                    ? new Date(ticket.checked_in_at).toLocaleString("en-IN")
                    : "N/A"}
                `,
                "error"
            );

            return;
        }

        // =====================================
        // STEP 2: CHECK-IN
        // =====================================

        showResult(
            `
            🎟️ <strong>Valid Ticket</strong><br><br>

            <strong>Name:</strong>
            ${ticket.name || "N/A"}<br>

            <strong>Ticket:</strong>
            ${ticket.ticket_code || "N/A"}<br>

            <strong>Event:</strong>
            ${ticket.event_title || "N/A"}<br><br>

            ⏳ Processing check-in...
            `,
            "info"
        );


        const checkinResponse = await fetch(
            `${API_URL}/api/checkin`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    ticket_code: ticket.ticket_code
                })
            }
        );


        const checkinData =
            await checkinResponse.json();

        console.log(
            "Check-in Response:",
            checkinData
        );


        if (!checkinResponse.ok) {

            throw new Error(
                checkinData.message ||
                "Check-in failed"
            );
        }


        // =====================================
        // STEP 3: SUCCESS
        // =====================================

        const checkedTicket =
            checkinData.ticket;

        showResult(
            `
            ✅ <strong>CHECK-IN SUCCESSFUL!</strong><br><br>

            <strong>Name:</strong>
            ${ticket.name || "N/A"}<br>

            <strong>Registration ID:</strong>
            ${ticket.registration_code || "N/A"}<br>

            <strong>Ticket:</strong>
            ${checkedTicket.ticket_code || ticket.ticket_code}<br>

            <strong>Event:</strong>
            ${ticket.event_title || "N/A"}<br>

            <strong>Venue:</strong>
            ${ticket.venue || "N/A"}<br><br>

            🕐 <strong>Checked in at:</strong><br>
            ${
                checkedTicket.checked_in_at
                    ? new Date(
                        checkedTicket.checked_in_at
                    ).toLocaleString("en-IN")
                    : new Date().toLocaleString("en-IN")
            }
            `,
            "success"
        );


    } catch (error) {

        console.error(
            "❌ Scanner Error:",
            error
        );

        showResult(
            `
            ❌ <strong>Invalid Ticket</strong><br><br>
            ${error.message}
            `,
            "error"
        );

    } finally {

        // Allow another scan after 3 seconds

        setTimeout(() => {

            isProcessing = false;

        }, 3000);
    }
}


// =====================================
// QR SCANNER CONFIGURATION
// =====================================

const scanner =
    new Html5QrcodeScanner(
        "reader",
        {
            fps: 10,

            qrbox: {
                width: 250,
                height: 250
            }
        },
        false
    );


// =====================================
// START SCANNER
// =====================================

scanner.render(
    onScanSuccess,

    (errorMessage) => {

        // Ignore continuous scanner errors

    }
);