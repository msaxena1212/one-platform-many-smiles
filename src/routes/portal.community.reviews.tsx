import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/portal/community/reviews")({
  component: CommunityReviews,
});

function CommunityReviews() {
  const [reviews] = useState([
    { id: 1, author: "Ahmed K.", facility: "Gym", rating: 5, text: "Excellent facility and staff!", date: "2026-06-20" },
    { id: 2, author: "Fatima M.", facility: "Pool", rating: 4, text: "Great for families, very clean", date: "2026-06-18" },
    { id: 3, author: "Omar H.", facility: "Event Hall", rating: 5, text: "Perfect for gatherings", date: "2026-06-15" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">Share your experience and see what others think</p>
        </div>
        <Button>+ Write Review</Button>
      </div>

      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-6 w-6 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="text-3xl font-bold">4.7/5</p>
            <p className="text-sm text-muted-foreground mt-1">{reviews.length} reviews from residents</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{review.facility} • {new Date(review.date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-foreground">{review.text}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="ghost" className="h-8">👍 Helpful</Button>
                <Button size="sm" variant="ghost" className="h-8">Flag</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
