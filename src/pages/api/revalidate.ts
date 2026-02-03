import { NextApiRequest, NextApiResponse } from "next";

const revalidateToken = process.env.REVALIDATE_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization;

  if (auth !== revalidateToken) {
    return res.status(401).json({ message: "Invalid token." });
  }
  const payload = req.body;

  const { pathname } = JSON.parse(payload);

  if (typeof pathname !== "string") {
    return res.status(401).json({ message: "Invalid path." });
  }

  try {
    await res.revalidate(pathname);
    return res.json({ revalidated: true, revalidatedPath: pathname });
  } catch (err) {
    return res.status(500).send("Error revalidating");
  }
}
