"use client";

import { Link, useParams } from "@/lib/navigation";
import { Star, Users, BookOpen } from "lucide-react";
import PageShell from "@/components/shared/page-shell";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NotFound from "@/app/not-found";
interface InstructorProfilePageProps {
  instructor: any;
  courses: any[];
}

const InstructorProfilePage = ({ instructor, courses: taughtCourses }: InstructorProfilePageProps) => {
  if (!instructor) return <NotFound />;

  const initials = instructor.name ? instructor.name.split(/\s+/).map((p: string) => p[0]).slice(0, 2).join("") : "U";

  return (
    <PageShell>
      

      <header className="flex flex-col sm:flex-row gap-6 sm:items-center pb-8 border-b">
        <Avatar className="h-24 w-24">
          {instructor.avatar ? <AvatarImage src={instructor.avatar} alt={instructor.name} /> : null}
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{instructor.name}</h1>
          {instructor.bio && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{instructor.bio}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary" />
              {instructor.totalCourses}টি কোর্স
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              {instructor.totalStudents.toLocaleString("bn-BD")} শিক্ষার্থী
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-primary fill-primary" />
              {instructor.averageRating} গড় রেটিং
            </span>
          </div>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">কোর্সসমূহ</h2>
        {taughtCourses.length === 0 ? (
          <p className="text-muted-foreground">এই মুহূর্তে কোনো কোর্স প্রকাশিত হয়নি।</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {taughtCourses.map((c) => (
              <Card key={c.id} className="overflow-hidden flex flex-col">
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  loading="lazy"
                  className="aspect-video object-cover"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <Badge variant="secondary" className="self-start mb-2">
                    {c.category?.name}
                  </Badge>
                  <h3 className="font-semibold line-clamp-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">
                    {c.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-semibold text-primary">৳{c.price}</span>
                    <Button asChild size="sm">
                      <Link to={`/courses/${c.id}`}>দেখুন</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default InstructorProfilePage;
