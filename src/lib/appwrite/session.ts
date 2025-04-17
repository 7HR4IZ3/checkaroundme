import { Account, Client } from "appwrite";

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)

  const account = new Account(client);

  return { client, account }
}
0