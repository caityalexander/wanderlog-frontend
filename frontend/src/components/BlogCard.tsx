import {Link} from "react-router-dom";

type BlogCardProps = {
    blogId: number;
    title: string;
    creatorFirstName: string;
    creatorLastName: string;
    creatorId: number;
    creationDate: string;
    city: string;
    categories: string[];
    numReactions: number;
    description: string;
};

function BlogCard({
                      blogId,
                      title,
                      creatorFirstName,
                      creatorLastName,
                      numReactions,
                      creationDate,
                      creatorId,
                      city,
                      categories,
    description,
                  }: BlogCardProps) {
    return (
        <a href={`/blog?blogId=${blogId}`}>
        <div className="blog-card">
            <div className="blog-card__image-wrap">
                <img
                    src={`${import.meta.env.VITE_API_URL}/blogs/${blogId}/image`}
                    alt={title}
                    className="blog-card__image"
                    onError={(e) => {
                        e.currentTarget.src =
                            "https://placehold.co/600x400?text=No+Image";
                    }}
                />
                <div className="blog-card__categories">
                    {categories.map((category) => (
                        <span key={category} className="blog-card__tag">
                            {category}
                        </span>
                    ))}
                </div>
            </div>

            <div className="blog-card__body">
                <p className="blog-card__date">
                    {new Date(creationDate).toLocaleDateString("en-NZ", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}
                    <span className="blog-card__city"> · {city}</span>
                </p>

                <h2 className="blog-card__title">{title}</h2>

                <div className="blog-card__footer">
                    <div className="blog-card__author">
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
                        <span className="blog-card__author-name">
                            {creatorFirstName} {creatorLastName}
                        </span>
                    </div>

                    <div className="blog-card__reactions">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        {numReactions}
                    </div>
                    < div >
                        <p>{description}</p>
                    </div>
                </div>
            </div>
        </div>
        </a>
    );
}

export default BlogCard;