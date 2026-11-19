import { timingSafeEqual } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

const revalidateToken = process.env.REVALIDATE_TOKEN;

function isValidToken(provided: string | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(providedBuf, expectedBuf);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed." });
  }

  const auth = req.headers.authorization;

  if (!isValidToken(auth, revalidateToken)) {
    return res.status(401).json({ message: "Invalid token." });
  }

  let body: unknown = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ message: "Invalid JSON payload." });
    }
  }

  const pathname = typeof body === "object" && body !== null ? (body as { pathname?: unknown }).pathname : undefined;

  if (typeof pathname !== "string" || !pathname.startsWith("/")) {
    return res.status(400).json({ message: "Invalid path." });
  }

  try {
    await res.revalidate(pathname);
    return res.json({ revalidated: true, revalidatedPath: pathname });
  } catch {
    return res.status(500).send("Error revalidating");
  }
}
