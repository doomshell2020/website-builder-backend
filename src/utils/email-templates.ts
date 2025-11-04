const SITE_URL = process.env.SITE_URL || 'https://doomshell.com/';
const FromUser = 'Website Builders';
const FromEmail = 'vikas@tirupatiplastomatics.com';
// const LOGO_URL = `https://www.geminipipes.com/images/doom_favi.png`;

function replacePlaceholders(
  template: string | undefined,
  variables: Record<string, string | number | undefined>
): string {
  if (typeof template !== 'string') return '';
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  }
  return result;
}

const UpdateStatus = ({
  fromUser,
  fromEmail,
  toEmail,
  subject,
  html,
  Name,
  password,
  username,
}: {
  fromUser?: string;
  fromEmail?: string;
  toEmail: string;
  subject: string;
  html: string;
  Name?: string;
  password?: string;
  username?: string;
}) => ({
  from: `${fromUser ?? FromUser} <${fromEmail ?? FromEmail}>`,
  to: toEmail,
  subject,
  html: replacePlaceholders(html, {
    Name,
    SITE_URL,
    // LOGO_URL,
    username,
    password,
  }),
});

export { UpdateStatus };