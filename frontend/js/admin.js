const API_URL = "http://localhost:5000";

let allRegistrations = [];


// =====================================
// ADMIN AUTHENTICATION CHECK
// =====================================

const adminToken = localStorage.getItem("adminToken");

if (!adminToken) {

    window.location.href = "admin-login.html";

}


// =====================================
// LOAD EVENTS
// =====================================

async function loadEvents() {

    try {

        const response = await fetch(
            `${API_URL}/api/admin/events`,
            {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Failed to load events"
            );

        }


        const eventSelect =
            document.getElementById("event-select");


        if (!eventSelect) {
            return;
        }


        eventSelect.innerHTML = "";


        if (
            !data.events ||
            data.events.length === 0
        ) {

            eventSelect.innerHTML =
                `<option value="">No events available</option>`;

            resetAttendance();

            return;

        }


        data.events.forEach(event => {

            const option =
                document.createElement("option");


            option.value =
                event.id;


            option.textContent =
                event.title;


            eventSelect.appendChild(option);

        });


        await loadAttendance(
            data.events[0].id
        );


    } catch (error) {

        console.error(
            "Events error:",
            error
        );


        const eventSelect =
            document.getElementById(
                "event-select"
            );


        if (eventSelect) {

            eventSelect.innerHTML =
                `<option value="">Failed to load events</option>`;

        }


        showMessage(
            "Failed to load events",
            true
        );

    }

}


// =====================================
// LOAD ATTENDANCE
// =====================================

async function loadAttendance(eventId) {

    if (!eventId) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/admin/attendance/${eventId}`,
            {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load attendance"
            );

        }


        const attendance =
            data.attendance;


        document.getElementById(
            "total-registrations"
        ).textContent =
            attendance.totalRegistrations;


        document.getElementById(
            "checked-in"
        ).textContent =
            attendance.checkedIn;


        document.getElementById(
            "not-checked-in"
        ).textContent =
            attendance.notCheckedIn;


        document.getElementById(
            "attendance-percentage"
        ).textContent =
            attendance.attendancePercentage;


        showMessage(
            "",
            false
        );


    } catch (error) {

        console.error(
            "Attendance error:",
            error
        );


        showMessage(
            "Failed to load attendance",
            true
        );

    }

}


// =====================================
// RESET ATTENDANCE
// =====================================

function resetAttendance() {

    document.getElementById(
        "total-registrations"
    ).textContent = "0";


    document.getElementById(
        "checked-in"
    ).textContent = "0";


    document.getElementById(
        "not-checked-in"
    ).textContent = "0";


    document.getElementById(
        "attendance-percentage"
    ).textContent = "0%";

}


// =====================================
// LOAD REGISTRATIONS
// =====================================

async function loadRegistrations() {

    try {

        const response = await fetch(
            `${API_URL}/api/admin/registrations`,
            {
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load registrations"
            );

        }


        allRegistrations =
            data.registrations || [];


        renderRegistrations(
            allRegistrations
        );


    } catch (error) {

        console.error(
            "Registrations error:",
            error
        );


        const table =
            document.getElementById(
                "registrations-table"
            );


        if (table) {

            table.innerHTML = `
                <tr>
                    <td colspan="9">
                        Failed to load registrations
                    </td>
                </tr>
            `;

        }

    }

}


// =====================================
// RENDER REGISTRATIONS
// =====================================

function renderRegistrations(registrations) {

    const table =
        document.getElementById(
            "registrations-table"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (
        !registrations ||
        registrations.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td colspan="9">
                    No registrations found
                </td>
            </tr>
        `;

        return;

    }


    registrations.forEach(
        registration => {

            const row =
                document.createElement("tr");


            const registeredDate =
                registration.registered_at
                    ? new Date(
                        registration.registered_at
                    ).toLocaleString("en-IN")
                    : "N/A";


            const checkedInTime =
                registration.checked_in_at
                    ? new Date(
                        registration.checked_in_at
                    ).toLocaleString("en-IN")
                    : "—";


            const statusHTML =
                registration.checked_in === true
                    ? `
                        <span class="checked">
                            ✅ Checked In
                        </span>
                    `
                    : `
                        <span class="not-checked">
                            ❌ Not Checked In
                        </span>
                    `;


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        registration.name
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        registration.email
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        registration.phone
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        registration.event_title
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        registration.registration_id
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        registration.ticket_code ||
                        "N/A"
                    )}
                </td>

                <td>
                    ${statusHTML}
                </td>

                <td>
                    ${escapeHTML(
                        checkedInTime
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        registeredDate
                    )}
                </td>

            `;


            table.appendChild(row);

        }
    );

}


// =====================================
// SEARCH + STATUS FILTER
// =====================================

function filterRegistrations() {

    const searchInput =
        document.getElementById(
            "registration-search"
        );


    const statusFilter =
        document.getElementById(
            "status-filter"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const status =
        statusFilter
            ? statusFilter.value
            : "all";


    const filteredRegistrations =
        allRegistrations.filter(
            registration => {

                const matchesSearch =

                    String(
                        registration.name || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        registration.email || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        registration.phone || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        registration.registration_id || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        registration.ticket_code || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        registration.event_title || ""
                    )
                        .toLowerCase()
                        .includes(search);


                let matchesStatus = true;


                if (status === "checked") {

                    matchesStatus =
                        registration.checked_in === true;

                }


                if (status === "not-checked") {

                    matchesStatus =
                        registration.checked_in === false;

                }


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderRegistrations(
        filteredRegistrations
    );

}


// =====================================
// EVENT CHANGE
// =====================================

const eventSelect =
    document.getElementById(
        "event-select"
    );


if (eventSelect) {

    eventSelect.addEventListener(
        "change",
        function () {

            const eventId =
                this.value;


            if (eventId) {

                loadAttendance(
                    eventId
                );

            }

        }
    );

}


// =====================================
// SEARCH INPUT
// =====================================

const searchInput =
    document.getElementById(
        "registration-search"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterRegistrations
    );

}


// =====================================
// STATUS FILTER
// =====================================

const statusFilter =
    document.getElementById(
        "status-filter"
    );


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterRegistrations
    );

}


// =====================================
// REFRESH DASHBOARD
// =====================================

const refreshButton =
    document.getElementById(
        "refresh-dashboard"
    );


if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        async () => {

            refreshButton.disabled = true;


            refreshButton.textContent =
                "⏳ Refreshing...";


            try {

                await Promise.all([
                    loadEvents(),
                    loadRegistrations()
                ]);


            } catch (error) {

                console.error(
                    "Refresh error:",
                    error
                );

            } finally {

                refreshButton.disabled = false;


                refreshButton.textContent =
                    "🔄 Refresh Dashboard";

            }

        }
    );

}


// =====================================
// LOGOUT
// =====================================

function logoutAdmin() {

    // Remove authentication data
    localStorage.removeItem("adminToken");

    // Remove old login flag
    localStorage.removeItem("adminLoggedIn");

    // Remove session data
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminLoggedIn");


    // IMPORTANT:
    // admin.html and admin-login.html
    // are both inside /frontend/
    window.location.href =
        "admin-login.html";

}


// =====================================
// CONNECT LOGOUT BUTTON
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const logoutButton =
            document.getElementById("logout-btn");


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutAdmin
            );

        }

    }
);


// =====================================
// MESSAGE
// =====================================

function showMessage(
    message,
    isError = false
) {

    const box =
        document.getElementById(
            "attendance-message"
        );


    if (!box) {
        return;
    }


    box.textContent =
        message;


    box.className =
        "message";


    if (isError) {

        box.classList.add(
            "error"
        );

    }

}


// =====================================
// SECURITY HELPER
// =====================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================
// START DASHBOARD
// =====================================

loadEvents();
loadRegistrations();