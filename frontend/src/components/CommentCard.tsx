type CommentCardProps = {
    commentId: number;
    creatorFirstName: string;
    creatorLastName: string;
    creatorId: number;
    comment: string;
    creationDate: string;
};

function CommentCard({
                         creatorFirstName,
                         creatorLastName,
                         creatorId,
                         comment,
                         creationDate,
                     }: CommentCardProps) {
    return (
        <div className="feed-card">
            <div className="feed-card__body">
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
    {new Date(creationDate).toLocaleString("en-NZ", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    })}
</span>
                    </div>
                </div>

                <p className="feed-card__desc">{comment}</p>
            </div>
        </div>
    );
}

export default CommentCard;