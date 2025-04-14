import { Account, Client } from "appwrite";
// import { cookies } from "next/headers";

export async function createSessionClient(cookie: string) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setSession(cookie);

  const account = new Account(client);

  return { client, account }
}
0