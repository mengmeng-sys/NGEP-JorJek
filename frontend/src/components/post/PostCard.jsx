// Owner: CS1
// post shape: { id, type, title, body, author: { displayName, karma }, tags: [{ tag: { id, name } }] }
export function PostCard({ post }) {
  return (
    <article>
      <span>{post.type}</span>
      <h3>{post.title}</h3>
      <p>{post.body}</p>
      <div>
        {post.tags.map(({ tag }) => (
          <span key={tag.id}>#{tag.name}</span>
        ))}
      </div>
      <span>by {post.author.displayName} ({post.author.karma} karma)</span>
    </article>
  );
}
