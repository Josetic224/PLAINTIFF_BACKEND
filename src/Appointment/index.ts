export const generateDynamicEmails = (clientName:any, FirmName:any,dateOfAppointment:any, timeOfAppointment:any) => {
    return `
    <!DOCTYPE html><html><head><link href="https://fonts.googleapis.com/css?family=Poppins&display=swap" rel="stylesheet" /><link href="./css/main.css" rel="stylesheet" /><title>Document</title></head><body><div class="v1_2"><div class="v7_42"></div><div class="v7_44"></div><div class="v22_56"><div class="v18_53"></div><div class="v6_2"><div class="v7_3"></div><div class="v7_8"></div><div class="name"></div><div class="v7_9"></div><div class="v7_10"></div><div class="v7_12"></div><div class="v7_11"></div><div class="v7_6"></div><span class="v7_14">Appointment Schedule</span></div><span class="v7_13">Dear,${clientName}</span><span class="v22_55">Your law firm ${FirmName}has scheduled an appointment with you!

    Date: ${dateOfAppointment}
    Time: ${timeOfAppointment}
    
    Best Regards!</span><div class="v22_54"><span class="v7_30">Powered by</span><div class="v7_29"></div></div><div class="v7_40"></div><div class="v7_48"></div><div class="v7_41"></div><div class="v7_46"></div></div><div class="v7_47"></div></div></body></html>

    `;
}