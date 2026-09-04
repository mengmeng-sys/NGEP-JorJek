import { useState, useEffect } from 'react';

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPosts([
      {
        id: 1,
        author: "Kwame Mensah",
        role: "Student",
        title: "How do I implement a CREATE VIEW statement for a multi-table database dashboard?",
        content: "I am working on a university group presentation and need help joining the user account table with the favorites list. Our schema has three relations and I can't figure out which join order reduces the query cost.",
        tags: ["SQL"],
        timestamp: "3h ago",
        upvotes: 124,
        comments: 14,
        hasUpvoted: false
      },
      {
        id: 2,
        author: "Lena Brandt",
        role: "Student",
        title: "Best practices for memory management in C++ — when to use smart pointers vs raw?",
        content: "I keep running into segfaults in my data structures assignment when I mix unique_ptr and raw pointers. Looking for a clear mental model on ownership semantics before my exam next week.",
        tags: ["C++"],
        timestamp: "5h ago",
        upvotes: 211,
        comments: 29,
        hasUpvoted: true
      }
    ]);
    setLoading(false);
  }, []);

  return { posts, loading };
}