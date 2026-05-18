import { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard";

type Blog = {
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

function MyBlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [cities, setCities] = useState<Record<number, string>>({});
    const [categories, setCategories] = useState<Record<number, string>>({});
    const [involvement, setInvolvement] = useState<Record<number, string[]>>({});
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCities();
        fetchCategories();
        fetchMyBlogs();
    }, []);

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

    async function userCommentedOnBlog(blogId: number, userId: number, token: string) {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/blogs/${blogId}/comments`,
            {
                headers: { "X-Authorization": token },
            }
        );

        if (!response.ok) {
            return false;
        }

        const comments = await response.json();

        return comments.some((comment: any) => comment.commenterId === userId);
    }


    async function fetchMyBlogs() {
        const token = localStorage.getItem("token");
        const userId = Number(localStorage.getItem("userId"));

        if (!token || !userId) {
            setError("You must be logged in to view your blogs.");
            return;
        }

        try {
            const createdResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/blogs?creatorId=${userId}`,
                {
                    headers: { "X-Authorization": token },
                }
            );

            const interactedResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/blogs?interactedByMe=true`,
                {
                    headers: { "X-Authorization": token },
                }
            );

            if (!createdResponse.ok || !interactedResponse.ok) {
                throw new Error("Failed to load your blogs.");
            }

            const createdData = await createdResponse.json();
            const interactedData = await interactedResponse.json();

            const allBlogsMap = new Map<number, Blog>();

            createdData.blogs.forEach((blog: Blog) => {
                allBlogsMap.set(blog.blogId, blog);
            });

            interactedData.blogs.forEach((blog: Blog) => {
                allBlogsMap.set(blog.blogId, blog);
            });

            const allBlogs = Array.from(allBlogsMap.values());
            setBlogs(allBlogs);

            const involvementMap: Record<number, string[]> = {};

            await Promise.all(
                allBlogs.map(async (blog) => {
                    const labels: string[] = [];

                    if (blog.creatorId === userId) {
                        labels.push("Created");
                    }

                    const commented = await userCommentedOnBlog(blog.blogId, userId, token);

                    const wasInteractedBlog = interactedData.blogs.some(
                        (b: Blog) => b.blogId === blog.blogId
                    );

                    const reacted = wasInteractedBlog && !commented;;

                    if (commented) {
                        labels.push("Commented");
                    }

                    if (reacted) {
                        labels.push("Reacted");
                    }

                    involvementMap[blog.blogId] = labels;
                })
            );

            setInvolvement(involvementMap);
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <div className="blog-page">
            <div className="blog-page__header">
                <h1 className="blog-page__title">My blogs</h1>
                <p className="blog-page__subtitle">
                    Blogs you have created, reacted to, or commented on.
                </p>
            </div>

            {error && <p className="blog-page__error">{error}</p>}

            {blogs.length === 0 ? (
                <p className="blog-page__empty">No involved blogs found.</p>
            ) : (
                <div className="blog-page__grid">
                    {blogs.map((blog) => (
                        <div key={blog.blogId} className="my-blog-wrapper">
                            <div className="my-blog-badges">
                                {involvement[blog.blogId]?.map((label) => (
                                    <span key={label} className="my-blog-badge">
                                        {label}
                                    </span>
                                ))}
                            </div>

                            <BlogCard
                                blogId={blog.blogId}
                                title={blog.title}
                                creatorFirstName={blog.creatorFirstName}
                                creatorLastName={blog.creatorLastName}
                                creatorId={blog.creatorId}
                                creationDate={blog.creationDate}
                                city={cities[blog.cityId]}
                                categories={blog.categoryIds.map((id) => categories[id])}
                                numReactions={blog.numReactions}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyBlogsPage;