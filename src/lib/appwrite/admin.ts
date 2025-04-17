import { Account, Client } from "appwrite";
import { cookies } from "next/headers";

export async function createAdminClient() {
  const session = await cookies().then(
    cookies => cookies.get("cham_appwrite_session")
  );

  const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  
  if (session?.value) {
    client.setSession(session.value);
  }

  const account = new Account(client);
  return { client, account }
}


