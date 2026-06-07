import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Variable Resend manquante: RESEND_API_KEY (remplacez re_xxxxxxxxx par votre vraie clé API dans .env.local)",
    );
  }

  return new Resend(apiKey);
}

export async function sendHelloWorldEmail() {
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "jacquesnoussougan93@gmail.com",
    subject: "Hello World",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
