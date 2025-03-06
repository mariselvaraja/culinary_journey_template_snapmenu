import { supabase } from '../lib/supabase';

/**
 * Send reservation confirmation email
 */
export async function sendConfirmationEmail(reservation) {
  try {
    // In a real application, you would integrate with an email service like SendGrid, AWS SES, etc.
    // For now, we'll just log the email content
    const emailContent = {
      to: reservation.email,
      subject: 'Reservation Confirmation',
      content: `
        Dear ${reservation.customer_name},

        Thank you for your reservation at Maison. Your reservation details are:

        Date: ${new Date(reservation.date).toLocaleDateString()}
        Time: ${reservation.time}
        Party Size: ${reservation.party_size} ${reservation.party_size === 1 ? 'Guest' : 'Guests'}
        Confirmation Number: ${reservation.id.slice(0, 8).toUpperCase()}

        Please arrive 5-10 minutes before your reservation time.
        Your table will be held for 15 minutes past the reservation time.

        To view, modify, or cancel your reservation, visit:
        ${window.location.origin}/reserve/lookup

        If you need to make any changes, please contact us at:
        Phone: (555) 123-4567
        Email: reservations@maison.com

        ${reservation.special_requests ? `\nSpecial Requests: ${reservation.special_requests}` : ''}

        We look forward to serving you!

        Best regards,
        Maison Restaurant
      `
    };

    // For development, just log the email
    console.log('Sending email:', emailContent);

    // In production, you would use an email service
    // await emailService.send(emailContent);

    // For now, we'll store it in Supabase for demo purposes
    const { error } = await supabase
      .from('emails')
      .insert([{
        to: reservation.email,
        subject: emailContent.subject,
        content: emailContent.content,
        reservation_id: reservation.id,
        status: 'sent',
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw the error - we don't want to break the reservation flow
    // if email sending fails
  }
}

/**
 * Send reservation cancellation email
 */
export async function sendCancellationEmail(reservation) {
  try {
    const emailContent = {
      to: reservation.email,
      subject: 'Reservation Cancellation Confirmation',
      content: `
        Dear ${reservation.customer_name},

        Your reservation at Maison has been cancelled.

        Cancelled Reservation Details:
        Date: ${new Date(reservation.date).toLocaleDateString()}
        Time: ${reservation.time}
        Party Size: ${reservation.party_size} ${reservation.party_size === 1 ? 'Guest' : 'Guests'}
        Confirmation Number: ${reservation.id.slice(0, 8).toUpperCase()}

        If you would like to make a new reservation, please visit:
        ${window.location.origin}/reserve

        If you need any assistance, please contact us at:
        Phone: (555) 123-4567
        Email: reservations@maison.com

        We hope to serve you another time!

        Best regards,
        Maison Restaurant
      `
    };

    // For development, just log the email
    console.log('Sending cancellation email:', emailContent);

    // Store in Supabase for demo purposes
    const { error } = await supabase
      .from('emails')
      .insert([{
        to: reservation.email,
        subject: emailContent.subject,
        content: emailContent.content,
        reservation_id: reservation.id,
        status: 'sent',
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error sending cancellation email:', error);
  }
}

/**
 * Send reservation modification email
 */
export async function sendModificationEmail(reservation, changes) {
  try {
    const emailContent = {
      to: reservation.email,
      subject: 'Reservation Update Confirmation',
      content: `
        Dear ${reservation.customer_name},

        Your reservation at Maison has been updated.

        Updated Reservation Details:
        Date: ${new Date(reservation.date).toLocaleDateString()}
        Time: ${reservation.time}
        Party Size: ${reservation.party_size} ${reservation.party_size === 1 ? 'Guest' : 'Guests'}
        Confirmation Number: ${reservation.id.slice(0, 8).toUpperCase()}

        Changes Made:
        ${Object.entries(changes)
          .map(([key, value]) => `${key.replace('_', ' ')}: ${value}`)
          .join('\n')}

        To view your reservation details, visit:
        ${window.location.origin}/reserve/lookup

        If you need to make any additional changes, please contact us at:
        Phone: (555) 123-4567
        Email: reservations@maison.com

        ${reservation.special_requests ? `\nSpecial Requests: ${reservation.special_requests}` : ''}

        We look forward to serving you!

        Best regards,
        Maison Restaurant
      `
    };

    // For development, just log the email
    console.log('Sending modification email:', emailContent);

    // Store in Supabase for demo purposes
    const { error } = await supabase
      .from('emails')
      .insert([{
        to: reservation.email,
        subject: emailContent.subject,
        content: emailContent.content,
        reservation_id: reservation.id,
        status: 'sent',
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error sending modification email:', error);
  }
}
