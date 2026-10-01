import { scryptSync, timingSafeEqual } from "node:crypto";
import { attachDatabasePool } from "@neon/functions";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
attachDatabasePool(pool);

const ADMIN_USERNAME = "foodio";
const PASSWORD_SALT = "465eea3443013198b592129340608fd0";
const PASSWORD_HASH = "abd57c7cff2bec96d6b4fab2ce5895e5583350e3099a8bf2dc8d82ea8b7ae832784d535b6d6a2ea29736d1d518e0e1d62402f8f78d3f8873f8378ddea6ac9574";
const ALLOWED_ORIGINS = new Set([
  "https://foodio-sigma.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

type PickupInput = { id?: string; name?: string; address?: string; time?: string; distance?: string; x?: number; y?: number };

function cors(request: Request) {
  const origin = request.headers.get("origin");
  return {
    ...(origin && ALLOWED_ORIGINS.has(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

function json(request: Request, body: unknown, status = 200) {
  return Response.json(body, { status, headers: cors(request) });
}

function isAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return false;
  try {
    const [username, password] = Buffer.from(authorization.slice(6), "base64").toString("utf8").split(":", 2);
    const supplied = scryptSync(password ?? "", PASSWORD_SALT, 64);
    return username.trim().toLowerCase() === ADMIN_USERNAME && timingSafeEqual(supplied, Buffer.from(PASSWORD_HASH, "hex"));
  } catch {
    return false;
  }
}

function validInput(input: PickupInput) {
  return typeof input.name === "string" && input.name.trim().length > 0
    && typeof input.address === "string" && input.address.trim().length > 0
    && typeof input.time === "string" && input.time.trim().length > 0
    && typeof input.distance === "string" && input.distance.trim().length > 0
    && typeof input.x === "number" && input.x >= 5 && input.x <= 95
    && typeof input.y === "number" && input.y >= 5 && input.y <= 95;
}

function slug(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "pickup";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export default async function pickups(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(request) });

  const url = new URL(request.url);
  if (url.pathname.endsWith("/auth")) {
    return isAdmin(request) ? json(request, { authenticated: true }) : json(request, { error: "The username or password is incorrect." }, 401);
  }

  if (request.method === "GET") {
    const result = await pool.query(`
      SELECT id, name, address, prep_time AS time, distance,
             map_x::float8 AS x, map_y::float8 AS y
      FROM pickup_points
      ORDER BY sort_order, created_at
    `);
    return json(request, result.rows);
  }

  if (!isAdmin(request)) return json(request, { error: "Unauthorized" }, 401);
  const input = await request.json().catch(() => ({})) as PickupInput;

  if (request.method === "POST") {
    if (!validInput(input)) return json(request, { error: "Enter valid pickup point details and coordinates from 5 to 95." }, 400);
    const result = await pool.query(`
      INSERT INTO pickup_points (id, name, address, prep_time, distance, map_x, map_y, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT coalesce(max(sort_order), 0) + 1 FROM pickup_points))
      RETURNING id, name, address, prep_time AS time, distance, map_x::float8 AS x, map_y::float8 AS y
    `, [slug(input.name!), input.name!.trim(), input.address!.trim(), input.time!.trim(), input.distance!.trim(), input.x, input.y]);
    return json(request, result.rows[0], 201);
  }

  if (request.method === "PUT") {
    if (typeof input.id !== "string" || !validInput(input)) return json(request, { error: "Enter valid pickup point details and coordinates from 5 to 95." }, 400);
    const result = await pool.query(`
      UPDATE pickup_points
      SET name = $2, address = $3, prep_time = $4, distance = $5, map_x = $6, map_y = $7, updated_at = now()
      WHERE id = $1
      RETURNING id, name, address, prep_time AS time, distance, map_x::float8 AS x, map_y::float8 AS y
    `, [input.id, input.name!.trim(), input.address!.trim(), input.time!.trim(), input.distance!.trim(), input.x, input.y]);
    return result.rows[0] ? json(request, result.rows[0]) : json(request, { error: "Pickup point not found." }, 404);
  }

  if (request.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) return json(request, { error: "Pickup point id is required." }, 400);
    const count = await pool.query("SELECT count(*)::int AS count FROM pickup_points");
    if (count.rows[0].count <= 1) return json(request, { error: "At least one pickup point is required." }, 409);
    const result = await pool.query("DELETE FROM pickup_points WHERE id = $1 RETURNING id", [id]);
    return result.rows[0] ? json(request, { deleted: id }) : json(request, { error: "Pickup point not found." }, 404);
  }

  return json(request, { error: "Method not allowed" }, 405);
}
