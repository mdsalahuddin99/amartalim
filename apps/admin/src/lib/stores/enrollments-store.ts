"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { driver } from "@/lib/data-driver";
import type { EnrollmentRecord } from "@/types/enrollment";

const RES = "enrollments";

const cache = () => driver.list<EnrollmentRecord>(RES);

export const enrollmentsStore = {
  forUser(userId: string): EnrollmentRecord[] {
    return cache()
      .filter((e) => e.userId === userId)
      .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
  },
  get(userId: string, courseId: string): EnrollmentRecord | undefined {
    return cache().find((e) => e.userId === userId && e.courseId === courseId);
  },
  exists(userId: string, courseId: string): boolean {
    return !!enrollmentsStore.get(userId, courseId);
  },
  async create(input: Omit<EnrollmentRecord, "id" | "enrolledAt">): Promise<EnrollmentRecord> {
    return api.post<EnrollmentRecord>("/enrollments", input);
  },
  async remove(id: string): Promise<void> {
    await api.del(`/enrollments/${id}`);
  },
};

export function useUserEnrollments(userId: string | undefined) {
  const [rows, setRows] = useState<EnrollmentRecord[]>(() =>
    userId ? enrollmentsStore.forUser(userId) : [],
  );
  useEffect(() => {
    const refresh = () => setRows(userId ? enrollmentsStore.forUser(userId) : []);
    refresh();
    return driver.subscribe(RES, refresh);
  }, [userId]);
  return rows;
}

export function useEnrollment(userId: string | undefined, courseId: string | undefined) {
  const [row, setRow] = useState<EnrollmentRecord | undefined>(() =>
    userId && courseId ? enrollmentsStore.get(userId, courseId) : undefined,
  );
  useEffect(() => {
    const refresh = () =>
      setRow(userId && courseId ? enrollmentsStore.get(userId, courseId) : undefined);
    refresh();
    return driver.subscribe(RES, refresh);
  }, [userId, courseId]);
  return row;
}
