import { ok, fail, registerMock } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { EnrollmentRecord } from "@/types/enrollment";

const RES = "enrollments";
const read = () => driver.list<EnrollmentRecord>(RES);
const write = (xs: EnrollmentRecord[]) => driver.save(RES, xs);

export const registerEnrollmentsMocks = () => {
  // GET /enrollments?userId=&courseId=
  registerMock("GET", /^\/enrollments$/, (req) => {
    const { userId = "", courseId = "" } = req.query;
    return ok(
      read().filter(
        (e) => (!userId || e.userId === userId) && (!courseId || e.courseId === courseId),
      ),
    );
  });

  // POST /enrollments  { userId, courseId, source, orderId? }
  registerMock("POST", /^\/enrollments$/, (req) => {
    const body = req.body as Omit<EnrollmentRecord, "id" | "enrolledAt">;
    if (!body?.userId || !body?.courseId) {
      return fail("BAD_INPUT", "userId এবং courseId প্রয়োজন।");
    }
    const list = read();
    const existing = list.find((e) => e.userId === body.userId && e.courseId === body.courseId);
    if (existing) return ok(existing);
    const rec: EnrollmentRecord = {
      ...body,
      id: `enr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      enrolledAt: new Date().toISOString(),
    };
    write([...list, rec]);
    return ok(rec);
  });

  // DELETE /enrollments/:id
  registerMock("DELETE", /^\/enrollments\/[^/]+$/, (req) => {
    const id = req.path.split("/").pop()!;
    write(read().filter((e) => e.id !== id));
    return ok({ id });
  });
};
