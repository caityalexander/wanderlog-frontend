type BlogCardProps = {
  blogId: number;
  title: string;
  creatorFirstName: string;
  creatorLastName: string;
  numReactions: number;
};

function BlogCard({ blogId, title, creatorFirstName, creatorLastName, numReactions }: BlogCardProps) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "8px",
      }}
    >
      <h2>{title}</h2>
      <p>
        By {creatorFirstName} {creatorLastName}
      </p>
      <p>Reactions: {numReactions}</p>
        <img
            src={`http://localhost:4941/api/v1/blogs/${blogId}/image`}
            alt={title}
            style={{ width: "200px", borderRadius: "8px" }}
        />
    </div>
  );
}

export default BlogCard;
