const API_URL = "";
document.addEventListener("DOMContentLoaded", async () => {

    // =====================================
    // GET TICKET CODE FROM URL
    // =====================================

    const params = new URLSearchParams(
        window.location.search
    );

    const ticketCode = params.get("ticketCode");

    console.log("Ticket Code:", ticketCode);

    if (!ticketCode) {
        showTicketError("No ticket code found in URL.");
        return;
    }

    try {

        // =====================================
        // FETCH TICKET DETAILS
        // =====================================

        const response = await fetch(
            `${API_URL}/api/tickets/${encodeURIComponent(ticketCode)}`
        );

        const data = await response.json();

        console.log("Ticket API Response:", data);

        if (!response.ok) {
            throw new Error(
                data.message || "Ticket not found"
            );
        }

        // =====================================
        // GET TICKET OBJECT
        // =====================================

        const ticket = data.ticket || data;

        console.log("Ticket Data:", ticket);

        // =====================================
        // PARTICIPANT DETAILS
        // =====================================

        setText(
            "participant-name",
            ticket.name
        );

        setText(
            "roll-number",
            ticket.roll_no
        );

        setText(
            "college-email",
            ticket.college_email || ticket.email
        );

        setText(
            "phone-number",
            ticket.phone
        );

        setText(
            "host-institution",
            ticket.host_institution
        );

        setText(
            "degree",
            ticket.degree
        );

        setText(
            "branch",
            ticket.branch
        );

        setText(
            "year-of-study",
            ticket.year_of_study
        );

        // =====================================
        // EVENT DETAILS
        // =====================================

        setText(
            "event-name",
            ticket.event_title || "Coders Era Workshop"
        );

        setText(
            "event-description",
            ticket.description || "Technical workshop for students"
        );

        setText(
            "event-date",
            formatDate(ticket.event_date)
        );

        // =====================================
        // EVENT TIME
        // =====================================

        if (
            ticket.start_time &&
            ticket.end_time
        ) {

            setText(
                "event-time",
                `${ticket.start_time} - ${ticket.end_time}`
            );

        } else {

            setText(
                "event-time",
                "—"
            );
        }

        setText(
            "event-venue",
            ticket.venue
        );

        // =====================================
        // TICKET CODE
        // =====================================

        setText(
            "ticket-code",
            ticket.ticket_code || ticketCode
        );

        // =====================================
        // QR CODE
        // =====================================

        const qrImage =
            document.getElementById("qr-code");

        if (qrImage) {

            if (ticket.qr_data) {

                qrImage.src = ticket.qr_data;

                qrImage.alt = "Ticket QR Code";

            } else {

                console.warn(
                    "QR data not found"
                );

                qrImage.alt =
                    "QR code unavailable";
            }
        }

        // =====================================
        // HIDE LOADING
        // =====================================

        const loading =
            document.getElementById("loading");

        if (loading) {
            loading.style.display = "none";
        }

        // =====================================
        // SHOW TICKET
        // =====================================

        const ticketContainer =
            document.getElementById(
                "ticket-container"
            );

        if (ticketContainer) {

            ticketContainer.style.display =
                "block";
        }

    } catch (error) {

        console.error(
            "Ticket loading error:",
            error
        );

        showTicketError(
            error.message ||
            "Unable to load ticket."
        );
    }
});


// =====================================
// SET TEXT SAFELY
// =====================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {

        console.warn(
            `Element #${id} not found`
        );

        return;
    }

    if (
        value !== undefined &&
        value !== null &&
        value !== ""
    ) {

        element.textContent = value;

    } else {

        element.textContent = "—";
    }
}


// =====================================
// FORMAT DATE
// =====================================

function formatDate(date) {

    if (!date) {
        return "—";
    }

    const parsedDate =
        new Date(date);

    if (
        isNaN(parsedDate.getTime())
    ) {

        return date;
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "numeric",
            year: "numeric"
        }
    );
}


// =====================================
// SHOW ERROR
// =====================================

function showTicketError(message) {

    const loading =
        document.getElementById("loading");

    if (loading) {
        loading.style.display = "none";
    }

    const errorBox =
        document.getElementById(
            "ticket-error"
        );

    if (errorBox) {

        errorBox.style.display =
            "block";

        errorBox.textContent =
            message;
    }

    console.error(
        "Ticket Error:",
        message
    );
}