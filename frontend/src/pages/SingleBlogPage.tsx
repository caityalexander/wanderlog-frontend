import { useEffect, useState } from "react";
import SingleBlogCard from "../components/SingleBlogCard";
import CommentCard from "../components/CommentCard";

type Blog = {
    blogId: number;
    title: string;
    creatorFirstName: string;
    creatorLastName: string;
    creatorId: number;
    creationDate: string;
    cityId: number;
    categoryIds: number[];
    reactions: {
        REACTION_1: number;
        REACTION_2: number;
        REACTION_3: number;
        REACTION_4: number;
    };
    description: string;
    series: string;
};

type Comment = {
    commentId: number;
    commenterId: number;
    commenterFirstName: string;
    commenterLastName: string;
    comment: string;
    timestamp: string;
    parentId: number | null;
};

function SingleBlogPage() {
    const params = new URLSearchParams(window.location.search);
    const blogId = params.get("blogId");

    const [error, setError] = useState("");
    const [blog, setBlog] = useState<Blog | null>(null);
    const [cities, setCities] = useState<Record<number, string>>({});
    const [categories, setCategories] = useState<Record<number, string>>({});
    const [comments, setComments] = useState<Comment[]>([]);

    const [reactions, setReactions] = useState({
        REACTION_1: 0,
        REACTION_2: 0,
        REACTION_3: 0,
        REACTION_4: 0,
    });

    useEffect(() => {
        fetchCities();
        fetchCategories();
        fetchBlog();
        fetchReactions();
        fetchComments();
    }, [blogId]);

    function fetchCities() {
        fetch(`${import.meta.env.VITE_API_URL}/blogs/cities`)
            .then((res) => res.json())
            .then((data) => {
                const cityMap: Record<number, string> = {};
                data.forEach((city: any) => {
                    cityMap[city.cityId] = city.name;
                });
                setCities(cityMap);
            });
    }

    function fetchCategories() {
        fetch(`${import.meta.env.VITE_API_URL}/blogs/categories`)
            .then((res) => res.json())
            .then((data) => {
                const categoryMap: Record<number, string> = {};
                data.forEach((category: any) => {
                    categoryMap[category.categoryId] = category.name;
                });
                setCategories(categoryMap);
            });
    }

    function fetchBlog() {
        if (!blogId) {
            setError("No blog ID provided");
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/blogs/${blogId}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch blog");
                return res.json();
            })
            .then((data) => setBlog(data))
            .catch((err) => setError(err.message));
    }

    function fetchReactions() {
        if (!blogId) return;

        fetch(`${import.meta.env.VITE_API_URL}/blogs/${blogId}/react`)
            .then((res) => res.json())
            .then((data) => {
                const counts = {
                    REACTION_1: 0,
                    REACTION_2: 0,
                    REACTION_3: 0,
                    REACTION_4: 0,
                };

                data.forEach((reaction: any) => {
                    if (reaction.reaction in counts) {
                        counts[reaction.reaction as keyof typeof counts]++;
                    }
                });

                setReactions(counts);
            });
    }

    function fetchComments() {
        if (!blogId) return;

        fetch(`${import.meta.env.VITE_API_URL}/blogs/${blogId}/comments`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch comments");
                return res.json();
            })
            .then((data) => {
                setComments(data);
            })
            .catch((err) => setError(err.message));
    }

    const parentComments = comments
        .filter((comment) => comment.parentId === null)
        .sort(
            (a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

    function repliesFor(parentId: number) {
        return comments
            .filter((comment) => comment.parentId === parentId)
            .sort(
                (a, b) =>
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
    }

    return (
        <div className="blog-page">
            {error && <p className="blog-page__error">{error}</p>}

            {!blog && !error && <p>Loading blog...</p>}

            {blog && (
                <>
                    <SingleBlogCard
                        blogId={blog.blogId}
                        title={blog.title}
                        creatorFirstName={blog.creatorFirstName}
                        creatorLastName={blog.creatorLastName}
                        creatorId={blog.creatorId}
                        creationDate={blog.creationDate}
                        city={cities[blog.cityId]}
                        categories={blog.categoryIds.map((id) => categories[id])}
                        reactions={reactions}
                        description={blog.description}
                        series={blog.series}
                    />

                    <h2 className="comments-title">Comments</h2>

                    {comments.length === 0 && <p>No comments yet.</p>}

                    {parentComments.map((comment) => (
                        <div key={comment.commentId}>
                            <CommentCard
                                commentId={comment.commentId}
                                creatorFirstName={comment.commenterFirstName}
                                creatorLastName={comment.commenterLastName}
                                creatorId={comment.commenterId}
                                comment={comment.comment}
                                creationDate={comment.timestamp}
                            />

                            <div style={{ marginLeft: "32px" }}>
                                {repliesFor(comment.commentId).map((reply) => (
                                    <CommentCard
                                        key={reply.commentId}
                                        commentId={reply.commentId}
                                        creatorFirstName={reply.commenterFirstName}
                                        creatorLastName={reply.commenterLastName}
                                        creatorId={reply.commenterId}
                                        comment={reply.comment}
                                        creationDate={reply.timestamp}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

export default SingleBlogPage;