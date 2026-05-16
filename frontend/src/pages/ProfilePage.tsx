import ProfileCard from "@/components/ProfileCard";
import { useEffect, useState } from "react";
import {useParams, useNavigation, useNavigate} from "react-router-dom";
import BlogCard from "@/components/BlogCard.tsx";

type UserProfile = {
    firstName: string;
    lastName: string;
    email?: string;
};

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
    series: string | null;
};

export default function ProfilePage() {
    const {id} = useParams();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState("");
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [cities, setCities] = useState<Record<number, string>>({});
    const [categories, setCategories] = useState<Record<number, string>>({});
    const loggedInUserId = Number(localStorage.getItem("userId"));
    const isOwnProfile = loggedInUserId === Number(id);

    useEffect(() => {
        if (!id) return;
        fetchUser();
        fetchUser();
        fetchBlogs();
        fetchCities();
        fetchCategories();
    }, [id]);
    const navigate = useNavigate();

    function fetchBlogs() {
        fetch(`${import.meta.env.VITE_API_URL}/blogs?creatorId=${id}`)
            .then((res) => res.json())
            .then((data) => setBlogs(data.blogs));
    }

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

    function fetchUser() {
        const token = localStorage.getItem("token");

        fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
            headers: token ? {"X-Authorization": token} : {},
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to load profile.");
                }
                return res.json();
            })
            .then((data) => {
                setUser(data);
            })
            .catch((err) => setError(err.message));
    }

    if (error) {
        return <p className="blog-page__error">{error}</p>;
    }

    if (!user || !id) {
        return <p>Loading profile...</p>;
    }

    const seriesGroups = blogs.reduce<Record<string, Blog[]>>((groups, blog) => {
        const seriesName = blog.series || "No Series";

        if (!groups[seriesName]) {
            groups[seriesName] = [];
        }

        groups[seriesName].push(blog);
        return groups;
    }, {});

    const sortedSeriesNames = Object.keys(seriesGroups).sort((a, b) => {
        if (a === "No Series") return 1;
        if (b === "No Series") return -1;
        return a.localeCompare(b);
    });

    sortedSeriesNames.forEach((seriesName) => {
        seriesGroups[seriesName].sort(
            (a, b) =>
                new Date(b.creationDate).getTime() -
                new Date(a.creationDate).getTime()
        );
    });

    return (
        <div className="profile-layout">
            <div className="profile-layout__sidebar">
                <ProfileCard
                    userId={Number(id)}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    email={user.email}
                    isOwnProfile={isOwnProfile}
                />

            </div>

            <div className="profile-layout__content">
                <h2 className="profile-series-title">Blogs by series</h2>

                {sortedSeriesNames.length === 0 ? (
                    <p className="blog-page__empty">
                        This user has not created any blogs.
                    </p>
                ) : (
                    sortedSeriesNames.map((seriesName) => (
                        <section
                            key={seriesName}
                            className="profile-series-group"
                        >
                            <h3 className="profile-series-heading">
                                {seriesName}
                            </h3>

                            <div className="blog-page__grid">
                                {seriesGroups[seriesName].map((blog) => (
                                    <BlogCard
                                        key={blog.blogId}
                                        blogId={blog.blogId}
                                        title={blog.title}
                                        creatorFirstName={blog.creatorFirstName}
                                        creatorLastName={blog.creatorLastName}
                                        creatorId={blog.creatorId}
                                        creationDate={blog.creationDate}
                                        city={cities[blog.cityId]}
                                        categories={blog.categoryIds.map(
                                            (categoryId) =>
                                                categories[categoryId]
                                        )}
                                        numReactions={blog.numReactions}
                                    />
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
}