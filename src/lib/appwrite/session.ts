import { Account, Client } from "appwrite";

export async function createSessionClient(cookie?: string) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
  
  if (cookie) {
    client.setSession(cookie);
  }

  const account = new Account(client);
  return { client, account }
}
0