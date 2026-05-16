import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SingleBlogCard from "../components/SingleBlogCard";
import CommentCard from "../components/CommentCard";
import BlogCard from "@/components/BlogCard.tsx";

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
type SimilarBlog = {
    blogId: number;
    title: string;
    creatorFirstName: string;
    creatorLastName: string;
    creatorId: number;
    creationDate: string;
    cityId: number;
    categoryIds: number[];
    numReactions: number;
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
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
    const [commentError, setCommentError] = useState("");

    const [similarBlogs, setSimilarBlogs] = useState<SimilarBlog[]>([]);

    const isLoggedIn = localStorage.getItem("token") !== null;


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

    useEffect(() => {
        if (blog) {
            fetchSimilarBlogs(blog);
        }
    }, [blog]);

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
        fetch(`${import.meta.env.VITE_API_URL}/blogs/${blogId}/comments`)
            .then((res) => res.json())
            .then(setComments)
            .catch(() => setCommentError("Failed to load comments."));
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

    function fetchSimilarBlogs(currentBlog: Blog) {
        fetch(`${import.meta.env.VITE_API_URL}/blogs`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch similar blogs");
                }

                return res.json();
            })
            .then((data) => {
                const filteredBlogs = data.blogs.filter(
                    (similarBlog: SimilarBlog) => {
                        if (similarBlog.blogId === currentBlog.blogId) {
                            return false;
                        }

                        const sameCreator =
                            similarBlog.creatorId === currentBlog.creatorId;

                        const sameCity =
                            similarBlog.cityId === currentBlog.cityId;

                        const sameCategory =
                            similarBlog.categoryIds.some((categoryId) =>
                                currentBlog.categoryIds.includes(categoryId)
                            );

                        return sameCreator || sameCity || sameCategory;
                    }
                );

                setSimilarBlogs(filteredBlogs);
            })
            .catch((err) => {
                setError(err.message);
            });
    }

    async function submitComment(e: React.FormEvent) {
        e.preventDefault();
        setCommentError("");

        const token = localStorage.getItem("token");

        if (!token) {
            setCommentError("Please log in or register to comment.");
            return;
        }

        if (!newComment.trim()) {
            setCommentError("Comment cannot be empty.");
            return;
        }

        const body =
            replyToCommentId === null
                ? { comment: newComment.trim() }
                : { comment: newComment.trim(), parentId: replyToCommentId };;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/${blogId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Authorization": token,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            setCommentError(response.statusText || "Failed to post comment.");
            return;
        }

        setNewComment("");
        setReplyToCommentId(null);
        fetchComments();
    }

    return (
        <div className="blog-page">
            {error && <p className="blog-page__error">{error}</p>}

            {!blog && !error && <p>Loading blog...</p>}

            {blog && (
                <div className="single-blog-layout">

                    <div className="single-blog-layout__post">
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
                            isLoggedIn={isLoggedIn}
                        />
                    </div>

                    <div className="comments-section">
                        <h2>Comments</h2>

                        <form onSubmit={submitComment} className="comment-form">
                            {replyToCommentId !== null && (
                                <p className="comment-replying">
                                    Replying to a comment
                                    <button type="button" onClick={() => setReplyToCommentId(null)}>
                                        Cancel
                                    </button>
                                </p>
                            )}

                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={replyToCommentId ? "Write your reply..." : "Write a comment..."}
                            />

                            {commentError && <p className="add-blog-error">{commentError}</p>}

                            <button type="submit" className="add-blog-primary">
                                {replyToCommentId ? "Post reply" : "Post comment"}
                            </button>
                        </form>

                        {parentComments.map((comment) => (
                            <div key={comment.commentId}>
                                <CommentCard
                                    commentId={comment.commentId}
                                    creatorFirstName={comment.commenterFirstName}
                                    creatorLastName={comment.commenterLastName}
                                    creatorId={comment.commenterId}
                                    comment={comment.comment}
                                    creationDate={comment.timestamp}
                                    isLoggedIn={isLoggedIn}
                                    onReply={setReplyToCommentId}
                                />

                                {repliesFor(comment.commentId).map((reply) => (
                                    <CommentCard
                                        key={reply.commentId}
                                        commentId={reply.commentId}
                                        creatorFirstName={reply.commenterFirstName}
                                        creatorLastName={reply.commenterLastName}
                                        creatorId={reply.commenterId}
                                        comment={reply.comment}
                                        creationDate={reply.timestamp}
                                        isReply={true}
                                        isLoggedIn={isLoggedIn}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {similarBlogs.length > 0 && (
                <>
                    <h2>Similar Blogs</h2>

                    <div className="blog-page__grid">
                        {similarBlogs.map((similarBlog) => (
                            <BlogCard
                                key={similarBlog.blogId}
                                blogId={similarBlog.blogId}
                                title={similarBlog.title}
                                creatorFirstName={similarBlog.creatorFirstName}
                                creatorLastName={similarBlog.creatorLastName}
                                creatorId={similarBlog.creatorId}
                                creationDate={similarBlog.creationDate}
                                city={cities[similarBlog.cityId]}
                                categories={similarBlog.categoryIds.map((id) => categories[id])}
                                numReactions={similarBlog.numReactions}
                            />
                        ))}
                    </div>
                </>
            )}

            </div>

    )}

export default SingleBlogPage;