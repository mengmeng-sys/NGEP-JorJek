import { PostForm } from "@/components/post/PostForm";

// Route: "/posts/new". Owner: CS1
export default function NewPostPage() {
  return (
    <main>
      <h1>New post</h1>
      <PostForm />
    </main>
  );
}
