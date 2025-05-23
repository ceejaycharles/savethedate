import { supabase } from './supabase';

export type EmailTemplate = {
  subject: string;
  body: string;
  variables: Record<string, string>;
};

export const templates = {
  invitation: {
    subject: "You're invited to {{eventName}}!",
    body: `
      <h1>You're Invited!</h1>
      <p>Dear {{guestName}},</p>
      <p>{{hostName}} has invited you to {{eventName}}.</p>
      <p>When: {{eventDate}}</p>
      <p>Where: {{eventLocation}}</p>
      <p><a href="{{rsvpLink}}">Click here to RSVP</a></p>
    `,
    variables: {
      eventName: '',
      guestName: '',
      hostName: '',
      eventDate: '',
      eventLocation: '',
      rsvpLink: ''
    }
  },
  reminder: {
    subject: "Reminder: RSVP for {{eventName}}",
    body: `
      <h1>RSVP Reminder</h1>
      <p>Dear {{guestName}},</p>
      <p>This is a friendly reminder to RSVP for {{eventName}}.</p>
      <p>When: {{eventDate}}</p>
      <p>Where: {{eventLocation}}</p>
      <p><a href="{{rsvpLink}}">Click here to RSVP</a></p>
    `,
    variables: {
      eventName: '',
      guestName: '',
      eventDate: '',
      eventLocation: '',
      rsvpLink: ''
    }
  },
  giftThankYou: {
    subject: "Thank you for your gift!",
    body: `
      <h1>Thank You!</h1>
      <p>Dear {{guestName}},</p>
      <p>Thank you so much for your generous gift for {{eventName}}.</p>
      <p>Best regards,</p>
      <p>{{hostName}}</p>
    `,
    variables: {
      guestName: '',
      eventName: '',
      hostName: ''
    }
  }
};

export async function sendEmail(templateName: keyof typeof templates, variables: Record<string, string>) {
  try {
    const template = templates[templateName];
    let subject = template.subject;
    let body = template.body;

    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    const { error } = await supabase.functions.invoke('send-email', {
      body: JSON.stringify({
        subject,
        body,
        to: variables.email
      })
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}