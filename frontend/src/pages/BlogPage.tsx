import { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard";
import { useNavigate } from "react-router-dom";


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

function BlogPage() {
    const navigate = useNavigate();
    const [cities, setCities] = useState<Record<number, string>>({});
    const [categories, setCategories] = useState<Record<number, string>>({});
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState("CREATED_DESC");

    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalBlogs, setTotalBlogs] = useState(0);
    const [numReactions, setNumReactions] = useState("");

    const totalPages = Math.ceil(totalBlogs / pageSize);
    const isFirstPage = page === 1;
    const isLastPage = page === totalPages || totalPages === 0;

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/blogs/cities`)
            .then((res) => res.json())
            .then((data) => {
                const cityMap: Record<number, string> = {};
                data.forEach((city: any) => {
                    cityMap[city.cityId] = city.name;
                });
                setCities(cityMap);
            });

        fetch(`${import.meta.env.VITE_API_URL}/blogs/categories`)
            .then((res) => res.json())
            .then((data) => {
                const categoryMap: Record<number, string> = {};
                data.forEach((category: any) => {
                    categoryMap[category.categoryId] = category.name;
                });
                setCategories(categoryMap);
            });
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [page]);

    function fetchBlogs(pageToFetch = page) {
        setError("");

        const params = new URLSearchParams();

        params.append("startIndex", String((pageToFetch - 1) * pageSize));
        params.append("count", String(pageSize));

        if (search.trim() !== "") {
            params.append("q", search.trim());
        }

        selectedCityIds.forEach((cityId) => {
            params.append("cityIds", cityId);
        });

        selectedCategoryIds.forEach((categoryId) => {
            params.append("categoryIds", categoryId);
        });

        if (sortBy !== "") {
            params.append("sortBy", sortBy);
        }

        if (numReactions !== "") {
            params.append("numReactions", numReactions);
        }

        fetch(`${import.meta.env.VITE_API_URL}/blogs?${params.toString()}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch blogs");
                }
                return res.json();
            })
            .then((data) => {
                setBlogs(data.blogs);
                setTotalBlogs(data.count);
            })
            .catch((err) => {
                setError(err.message);
            });
    }

    function applySearchAndFilters() {
        setPage(1);
        fetchBlogs(1);
    }

    function clearAll() {
        setSearch("");
        setSelectedCityIds([]);
        setSelectedCategoryIds([]);
        setSortBy("CREATED_DESC");
        setPage(1);
        setNumReactions("");

        setError("");

        const params = new URLSearchParams();
        params.append("startIndex", "0");
        params.append("count", String(pageSize));
        params.append("sortBy", "CREATED_DESC");

        fetch(`${import.meta.env.VITE_API_URL}/blogs?${params.toString()}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch blogs");
                }
                return res.json();
            })
            .then((data) => {
                setBlogs(data.blogs);
                setTotalBlogs(data.count);
            })
            .catch((err) => {
                setError(err.message);
            });
    }

    type CheckboxDropdownProps = {
        label: string;
        options: Record<number, string>;
        selectedValues: string[];
        setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>;
    };

    function goToFirstPage() {
        setPage(1);
    }

    function goToPreviousPage() {
        if (page > 1) {
            setPage(page - 1);
        }
    }

    function goToNextPage() {
        if (page < totalPages) {
            setPage(page + 1);
        }
    }

    function goToLastPage() {
        setPage(totalPages);
    }

    function CheckboxDropdown({
                                  label,
                                  options,
                                  selectedValues,
                                  setSelectedValues,
                              }: CheckboxDropdownProps) {
        const [open, setOpen] = useState(false);

        function toggleValue(value: string) {
            if (selectedValues.includes(value)) {
                setSelectedValues(selectedValues.filter((item) => item !== value));
            } else {
                setSelectedValues([...selectedValues, value]);
            }
        }

        return (
            <div className="checkbox-dropdown">
                <button
                    type="button"
                    className="blog-page__select checkbox-dropdown__button"
                    onClick={() => setOpen(!open)}
                >
                    {selectedValues.length === 0
                        ? `Select ${label.toLowerCase()}`
                        : `${selectedValues.length} selected`}
                </button>

                {open && (
                    <div className="checkbox-dropdown__menu">
                        {Object.entries(options).map(([id, name]) => (
                            <label key={id} className="checkbox-dropdown__option">
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(id)}
                                    onChange={() => toggleValue(id)}
                                />
                                <span>{name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className="blog-page">

            {error && <p className="blog-page__error">{error}</p>}

            <div className="blog-page__layout">
                <aside className="blog-page__sidebar">
                    <h2 className="blog-page__sidebar-title">Filter blogs</h2>

                    <label className="blog-page__label">Cities</label>
                    <CheckboxDropdown
                        label="Cities"
                        options={cities}
                        selectedValues={selectedCityIds}
                        setSelectedValues={setSelectedCityIds}
                    />

                    <label className="blog-page__label">Categories</label>
                    <CheckboxDropdown
                        label="Categories"
                        options={categories}
                        selectedValues={selectedCategoryIds}
                        setSelectedValues={setSelectedCategoryIds}
                    />

                    <label className="blog-page__label">Minimum reactions</label>
                    <input
                        type="number"
                        min="0"
                        value={numReactions}
                        onChange={(e) => setNumReactions(e.target.value)}
                        className="blog-page__select"
                    />

                    <label className="blog-page__label">Sort by</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="blog-page__select"
                    >
                        <option value="CREATED_DESC">Newest first</option>
                        <option value="CREATED_ASC">Oldest first</option>
                        <option value="ALPHABETICAL_ASC">Title A-Z</option>
                        <option value="ALPHABETICAL_DESC">Title Z-A</option>
                        <option value="REACTIONS_DESC">Most reactions</option>
                        <option value="REACTIONS_ASC">Least reactions</option>
                    </select>

                    <button onClick={applySearchAndFilters} className="blog-page__apply-btn">
                        Apply filters
                    </button>

                    <button onClick={clearAll} className="blog-page__clear-btn">
                        Clear filters
                    </button>

                </aside>

                <main className="blog-page__main">
                    <div className="blog-page__top-bar">
                        <div className="blog-page__search-bar">
                            <input
                                type="text"
                                placeholder="Search by title or description"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && applySearchAndFilters()}
                                className="blog-page__search-input"
                            />

                            <button
                                onClick={applySearchAndFilters}
                                className="blog-page__search-btn"
                            >
                                Search
                            </button>
                        </div>

                        <button
                            className="blog-page__search-btn"
                            onClick={() => navigate("/create")}
                        >
                            + Add Blog
                        </button>
                    </div>

                    <div className="blog-page__results-header">
                        <h2>{totalBlogs} blogs found</h2>
                    </div>

                    {blogs.length === 0 ? (
                        <p className="blog-page__empty">No blogs found.</p>
                    ) : (
                        <div className="blog-page__grid">
                            {blogs.map((blog) => (
                                <BlogCard
                                    key={blog.blogId}
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
                            ))}
                        </div>
                    )}

                    {totalBlogs > pageSize && (
                        <>
                            <div className="blog-page__pagination">
                                <button onClick={goToFirstPage} disabled={isFirstPage}>
                                    First
                                </button>

                                <button onClick={goToPreviousPage} disabled={isFirstPage}>
                                    Previous
                                </button>

                                <span>
                Page {page} of {totalPages}
            </span>

                                <button onClick={goToNextPage} disabled={isLastPage}>
                                    Next
                                </button>

                                <button onClick={goToLastPage} disabled={isLastPage}>
                                    Last
                                </button>
                            </div>

                            {isLastPage && (
                                <p className="blog-page__last-page-message">
                                    You have reached the last page.
                                </p>
                            )}
                        </>
                    )}
                </main>
    </div>
            </div>
    );
}

export default BlogPage;