function generateDynamicEmails(clientName, FirmName, dateOfAppointment, timeOfAppointment) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
    /* Your CSS styles here */
    </style>
    </head>
    <body>
    <div>
        <!-- Your HTML content here -->
        <h1>Appointment Schedule</h1>
        <p>Dear ${clientName},</p>
        <p>Your law firm ${FirmName} has scheduled an appointment with you!</p>
        <p>Date: ${dateOfAppointment}</p>
        <p>Time: ${timeOfAppointment}</p>
        <p>Best Regards!</p>
    </div>
    </body>
    </html>
    `;
}