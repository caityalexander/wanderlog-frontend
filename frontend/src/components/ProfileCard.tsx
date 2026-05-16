import {useNavigate} from "react-router-dom";

type ProfileCardProps = {
    userId: number;
    firstName: string;
    lastName: string;
    email?: string;
    isOwnProfile: boolean;
};

function ProfileCard({
                         userId,
                         firstName,
                         lastName,
                         email,
                         isOwnProfile,
                     }: ProfileCardProps) {
    const navigate = useNavigate();
    return (
        <div className="profile-card">
            <img
                src={`${import.meta.env.VITE_API_URL}/users/${userId}/image`}
                alt={`${firstName} ${lastName}`}
                className="profile-card__image"
                onError={(e) => {
                    e.currentTarget.src =
                        `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=e0e0e0&color=555`;
                }}
            />

            <div className="profile-card__body">
                <h2>
                    {firstName} {lastName}
                </h2>

                {email && (
                    <p className="profile-card__email">{email}</p>
                )}

                {isOwnProfile && (
                    <button className="blog-page__search-btn" onClick={() => navigate(`/profile-edit/${userId}`)}>
                        Edit profile
                    </button>
                )}
            </div>
        </div>
    );
}

export default ProfileCard;