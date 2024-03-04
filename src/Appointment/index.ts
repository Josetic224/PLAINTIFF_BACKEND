export const generateEmailTemplate = (clientName: any, FirmName: any, dateOfAppointment: any, timeOfAppointment: any, ContactNumber: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
    <title>Appointment Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
    
    <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; box-sizing: border-box;">
      <div class="logo" style="text-align: center; margin-bottom: 20px;">
        <!-- Space for your logo -->
        <img src="https://media.licdn.com/dms/image/D4D22AQHzCBwHXAWCdQ/feedshare-shrink_800/0/1707289741759?e=1712188800&v=beta&t=4LcmAnF6Vx3YhR5MlRRJ_reDf1ms6dRL3IP3fKYGMPY" alt="Your Law Firm Logo" style="max-width: 200px; height: auto;">
      </div>
    
      <div class="reminder" style="color: #1e376b; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        <p>Dear ${clientName},</p>
        <p>This is a friendly reminder from ${FirmName} regarding your upcoming appointment with us.</p>
      </div>
    
      <div class="appointment-details" style="margin-bottom: 20px;">
        <p><strong>Appointment Details:</strong></p>
        <p>Date: ${dateOfAppointment}</p>
        <p>Time: ${timeOfAppointment}</p>
      </div>
    
      <p>Please ensure that you mark your calendar accordingly and plan to arrive a few minutes early to ensure a timely start to our meeting.</p>
    
      <p>Should you have any questions or need to reschedule, please don't hesitate to contact us at ${ContactNumber}.</p>
    
      <p>We look forward to meeting with you and assisting you with your legal matters.</p>
    
      <p>Best regards,</p>
      <p>${FirmName}<br>${ContactNumber}</p>
    </div>
    
    </body>
    </html>
  `;
}
