import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const appResponse = (c: Context, status: ContentfulStatusCode, message: string, results?: any) => {

    return c.json({ message, results }, status)

}
