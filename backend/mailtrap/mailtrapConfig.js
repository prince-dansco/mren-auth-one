import { MailtrapClient } from 'mailtrap'
import dotenv from 'dotenv';

dotenv.config()

export const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_API,
  endpoint:process.env. MAILTRAP_ENDPOINT
});
export const sender = {
  email: "hello@demomailtrap.co",
  name: "dansco hub",
};


