import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  const response = Response.json({}, { status: 200 });

  response.cookies.set("access-token", "we did it");

  return response;
};
