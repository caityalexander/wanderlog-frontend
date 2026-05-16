import {Link} from "react-router-dom";

type CommentCardProps = {
    commentId: number;
    creatorFirstName: string;
    creatorLastName: string;
    creatorId: number;
    comment: string;
    creationDate: string;
    isReply?: boolean;
    isLoggedIn: boolean;
    onReply?: (commentId: number) => void;
};

function CommentCard({
                         commentId,
                         creatorFirstName,
                         creatorLastName,
                         creatorId,
                         comment,
                         creationDate,
                         isReply = false,
                         isLoggedIn,
                         onReply,
                     }: CommentCardProps) {
    return (
        <div className={isReply ? "comment-card comment-card--reply" : "comment-card"}>
            <div className="feed-card__body">
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

                {!isReply && isLoggedIn && onReply && (
                    <button
                        className="comment-reply-btn"
                        onClick={() => onReply(commentId)}
                    >
                        Reply
                    </button>
                )}
            </div>
        </div>
    );
}

export default CommentCard;