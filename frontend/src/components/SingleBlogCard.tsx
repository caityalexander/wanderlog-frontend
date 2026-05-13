import { Cherry, Cake, Rainbow, Cat } from "lucide-react";

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
                        }: SingleBlogCardProps) {
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
                    <img
                        src={`${import.meta.env.VITE_API_URL}/users/${creatorId}/image`}
                        alt={`${creatorFirstName} ${creatorLastName}`}
                        className="feed-card__avatar"
                        onError={(e) => {
                            e.currentTarget.src =
                                `https://ui-avatars.com/api/?name=${creatorFirstName}+${creatorLastName}&background=e0e0e0&color=555`;
                        }}
                    />

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
                    <button className="feed-card__action-btn">
                        <Cherry size={20} color="#E8B3B3" />
                        {reactions.REACTION_1}
                    </button>

                    <button className="feed-card__action-btn">
                        <Cat size={20} color="#C9B3E8" />
                        {reactions.REACTION_2}
                    </button>

                    <button className="feed-card__action-btn">
                        <Cake size={20} color="#94C4FF" />
                        {reactions.REACTION_3}
                    </button>

                    <button className="feed-card__action-btn">
                        <Rainbow size={20} color="#FFF494" />
                        {reactions.REACTION_4}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SingleBlogCard;