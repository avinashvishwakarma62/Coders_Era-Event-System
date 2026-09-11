const API_URL = "http://localhost:5000";

async function loadTicket() {
    const params = new URLSearchParams(window.location.search);

    const ticketCode =
        params.get("ticketCode") ||
        params.get("ticket");

    if (!ticketCode) {
        document.getElementById("event-title").textContent = "Ticket Not Found";
        document.getElementById("event-description").textContent =
            "Ticket code is missing from URL.";
        return;
    }

    console.log("Loading ticket:", ticketCode);

    try {
        const response = await fetch(
            `${API_URL}/api/tickets/${encodeURIComponent(ticketCode)}`
        );

        const data = await response.json();

        console.log("API Response:", data);

        if (!response.ok) {
            throw new Error(data.message || "Ticket not found");
        }

        const ticket = data.ticket;

        document.getElementById("event-title").textContent =
            ticket.event_title || "N/A";

        document.getElementById("event-description").textContent =
            ticket.description || "";

        document.getElementById("participant-name").textContent =
            ticket.name || "N/A";

        document.getElementById("registration-id").textContent =
            ticket.registration_code || "N/A";

        document.getElementById("ticket-code").textContent =
            ticket.ticket_code || "N/A";

        document.getElementById("venue").textContent =
            ticket.venue || "N/A";

        if (ticket.event_date) {
            const date = new Date(ticket.event_date);
            document.getElementById("event-date").textContent =
                date.toLocaleDateString("en-IN");
        } else {
            document.getElementById("event-date").textContent = "N/A";
        }

        let time = "N/A";

        if (ticket.start_time) {
            time = ticket.start_time.substring(0, 5);

            if (ticket.end_time) {
                time += " - " + ticket.end_time.substring(0, 5);
            }
        }

        document.getElementById("event-time").textContent = time;

        // QR
        const qr = document.getElementById("qr-code");

        if (ticket.qr_data) {
            qr.src = ticket.qr_data;
            qr.style.display = "block";
        } else {
            qr.style.display = "none";
        }

        // Status
        const status = document.getElementById("ticket-status");

        if (ticket.checked_in) {
            status.textContent = "✅ Checked In";
            status.className = "checked";
        } else {
            status.textContent = "🎟️ Valid Ticket";
            status.className = "not-checked";
        }

        console.log("✅ Ticket loaded successfully");

    } catch (error) {
        console.error("❌ Ticket error:", error);

        document.getElementById("event-title").textContent =
            "Ticket Not Found";

        document.getElementById("event-description").textContent =
            error.message;

        document.getElementById("participant-name").textContent = "N/A";
        document.getElementById("registration-id").textContent = "N/A";
        document.getElementById("ticket-code").textContent = "N/A";
        document.getElementById("venue").textContent = "N/A";
        document.getElementById("event-date").textContent = "N/A";
        document.getElementById("event-time").textContent = "N/A";

        const qr = document.getElementById("qr-code");

        if (qr) {
            qr.style.display = "none";
        }

        if (status) {
            status.textContent = "❌ " + error.message;
            status.className = "not-checked";
        }
    }
}

document.addEventListener("DOMContentLoaded", loadTicket);