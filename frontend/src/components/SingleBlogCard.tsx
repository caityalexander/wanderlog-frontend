import { Cherry, Cake, Rainbow, Cat, Headphones, PencilLine, Trash2} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";

type SingleBlogCardProps = {
    blogId: number;
    title: string;
    creatorFirstName: string;
    creatorLastName: string;
    creatorId: number;
    creationDate: string;
    city: string;
    categories: string[];
    reactions: {
        REACTION_1: number;
        REACTION_2: number;
        REACTION_3: number;
        REACTION_4: number;
        REACTION_5: number;
    };
    description: string;
    series?: string;
    isLoggedIn: boolean;
    uniqueCommenters: number;
    userReaction?: string | null;
};

function SingleBlogCard({
                            blogId,
                            title,
                            creatorFirstName,
                            creatorLastName,
                            reactions,
                            creationDate,
                            creatorId,
                            city,
                            categories,
                            description,
                            series,
                            isLoggedIn,
                            uniqueCommenters,
                            userReaction,
                        }: SingleBlogCardProps) {
    const navigate = useNavigate();

    async function reactToBlog(reactionType: string) {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("You must be logged in to react to a blog.");
            return;
        }

        const isRemovingReaction = userReaction === reactionType;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/${blogId}/react`, {
            method: isRemovingReaction ? "DELETE" : "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Authorization": token,
            },
            body: isRemovingReaction
                ? undefined
                : JSON.stringify({
                    reaction: reactionType,
                }),
        });

        if (!response.ok) {
            alert(response.statusText || "Could not update reaction.");
            return;
        }

        window.location.reload();
    }

    async function deleteBlog() {
        if(uniqueCommenters > 0) {
            alert("You cannot delete a blog with more than 1 comment.");
            return;
        }
        const confirmed = window.confirm("Are you sure you want to delete this blog?");

        if (!confirmed) return;

        const token = localStorage.getItem("token");

        if (!token) {
            alert("You must be logged in to delete a blog.");
            return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/${blogId}`, {
            method: "DELETE",
            headers: {
                "X-Authorization": token,
            },
        });

        if (!response.ok) {
            alert(response.statusText || "Could not delete blog.");
            return;
        }

        navigate("/");
    }

    return (
        <div className="feed-card">
            <img
                src={`${import.meta.env.VITE_API_URL}/blogs/${blogId}/image`}
                alt={title}
                className="feed-card__hero"
                onError={(e) => {
                    e.currentTarget.src =
                        "https://placehold.co/520x293?text=No+Image";
                }}
            />

            <div className="feed-card__body">
                {/* Author row */}
                <div className="feed-card__author-row">
                    <Link to={`/profile/${creatorId}`}>
                        <img
                            src={`${import.meta.env.VITE_API_URL}/users/${creatorId}/image`}
                            alt={`${creatorFirstName} ${creatorLastName}`}
                            className="feed-card__avatar feed-card__avatar--clickable"
                            onError={(e) => {
                                e.currentTarget.src =
                                    `https://ui-avatars.com/api/?name=${creatorFirstName}+${creatorLastName}&background=e0e0e0&color=555`;
                            }}
                        />
                    </Link>

                    <div className="feed-card__author-meta">
                        <span className="feed-card__author-name">
                            {creatorFirstName} {creatorLastName}
                        </span>

                        <span className="feed-card__byline">
                            {new Date(creationDate).toLocaleDateString("en-NZ", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}

                            <span className="feed-card__dot"> · </span>

                            {city}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <h2 className="feed-card__title">{title}</h2>

                <p className="feed-card__desc">{description}</p>
                <p className="feed-card__commenters">
                    {uniqueCommenters} unique commenter{uniqueCommenters !== 1 ? "s" : ""}
                </p>

                {/* Series */}
                {series && (
                    <>
                        <p className="feed-card__section-title">Series</p>

                        <div className="feed-card__tags">
                                <span
                                    className="feed-card__tag_series"
                                >
                                    {series}
                                </span>
                        </div>
                    </>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                    <>
                        <p className="feed-card__section-title">
                            Categories
                        </p>

                        <div className="feed-card__tags">
                            {categories.map((category, index) => (
                                <span
                                    key={`${category}-${index}`}
                                    className="feed-card__tag"
                                >
                                    {category}
                                </span>
                            ))}
                        </div>
                    </>
                )}

                {/* Reactions */}
                <div className="feed-card__actions">
                    <button className="feed-card__action-btn" onClick={() => reactToBlog("REACTION_1")}>
                        <Cherry size={20} color="#E8B3B3" />
                        {reactions.REACTION_1}
                    </button>

                    <button className="feed-card__action-btn" onClick={() => reactToBlog("REACTION_2")}>
                        <Cat size={20} color="#C9B3E8" />
                        {reactions.REACTION_2}
                    </button>

                    <button className="feed-card__action-btn" onClick={() => reactToBlog("REACTION_3")}>
                        <Cake size={20} color="#94C4FF" />
                        {reactions.REACTION_3}
                    </button>

                    <button className="feed-card__action-btn" onClick={() => reactToBlog("REACTION_4")}>
                        <Rainbow size={20} color="#F7EF5E" />
                        {reactions.REACTION_4}
                    </button>

                    <button className="feed-card__action-btn" onClick={() => reactToBlog("REACTION_5")}>
                        <Headphones size={20} color="#91F792" />
                        {reactions.REACTION_5}
                    </button>

                    <div className="feed-card__spacer" />

                    {isLoggedIn && (
                        <div className="feed-card__manage">

                            <button className="feed-card__icon-btn"  onClick={() => navigate(`/edit/${blogId}`)}>
                                <PencilLine size={18} color="#001BFF" />
                            </button>
                            <button
                                className="feed-card__icon-btn"
                                onClick={deleteBlog}
                            >
                                <Trash2 size={18} color="#FF2100" />
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default SingleBlogCard;