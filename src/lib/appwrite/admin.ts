import { Account, Client } from "appwrite";
import { cookies } from "next/headers";

export async function createAdminClient() {
  const session = await cookies().then(
    cookies => cookies.get("cham_appwrite_session")
  );

  if (!session?.value) {
    throw new Error("Unauthenticated user");
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setSession(session.value);

  const account = new Account(client);

  return { client, account }
}


