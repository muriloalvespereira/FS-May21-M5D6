  
import sgMail from "@sendgrid/mail"
 
 
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmail = async recipient => {
try {
    
    const msg = {
      to: recipient,
      from: "murilo.udi@gmail.com",
      subject: "Sending with Twilio SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>"
    }
  
    await sgMail.send(msg)
} catch (error) {
    console.log(error)
    throw error
}
}