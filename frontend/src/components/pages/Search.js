import { useEffect, useState } from "react";
import axios from "axios";
import { Status } from "../../State";
import Spinner from "../general/Spinner";
import { toParams, toQuery } from "../utils/Routing";
import { Helmet } from "react-helmet-async";
import { Globals } from "../../GlobalData";
import { useHistory, useLocation } from "react-router-dom";
import IdeaSummaryUpvotes from "./../ideaComponents/IdeaSummaryUpvotes";
import ProjectSummaryUpvotes from "./../projectComponents/ProjectSummaryUpvotes";

export default function Search() {
    let history = useHistory();
    let location = useLocation();
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState(Status.NotSubmitted);
    const [query, setQuery] = useState("");
    const [lastPage, setLastPage] = useState(true);
    const [type, setType] = useState("ideas");
    const params = toParams(location.search.replace(/^\?/, ""));
    if (!params.page) params.page = 1;

    useEffect(() => {
        if (params.query) {
            setQuery(decodeURI(params.query));
            setType(params.type);
            setStatus(Status.Loading);
        }
    }, [location]);

    useEffect(() => {
        if (status === Status.Loading) {
            executeSearch();
        }
    }, [status]);

    const executeSearch = () => {
        axios
            .get(
                process.env.REACT_APP_API +
                    "" +
                    type +
                    "/search?" +
                    toQuery({ query: params.query, page: params.page })
            )
            .then((response) => {
                if (type === "ideas") {
                    setPosts(response.data.ideaPreviews);
                }
                if (type === "projects") {
                    setPosts(response.data.projectPreviews);
                }
                setLastPage(response.data.lastPage);
                setStatus(Status.Success);
            });
    };

    const next = () => {
        history.push(
            "/search?" +
                toQuery({
                    type: type,
                    query: query,
                    page: parseInt(params.page) + 1,
                })
        );
    };

    const previous = () => {
        history.push(
            "/search?" +
                toQuery({
                    type: type,
                    query: query,
                    page: parseInt(params.page) - 1,
                })
        );
    };

    const handleInputChange = (event) => {
        setQuery(event.target.value);
    };

    const changeType = (event) => {
        if (query != "") {
            history.push(
                "/search?" +
                    toQuery({ type: event.target.value, query: query, page: 1 })
            );
        }
        setLastPage(true);
        setStatus(Status.NotSubmitted);
        setType(event.target.value);
    };

    const handleSubmit = (event) => {
        history.push(
            "/search?" + toQuery({ type: type, query: query, page: 1 })
        );
        event.preventDefault();
    };

    let postElements;
    if (status == Status.Loading) {
        postElements = <Spinner />;
    } else if (status == Status.Success && posts.length > 0) {
        postElements = (
            <div className="container mx-auto">
                {posts.map((post) =>
                    type === "ideas" ? (
                        <div className="my-2" key={post.id}>
                            <IdeaSummaryUpvotes idea={post} />
                        </div>
                    ) : (
                        <div className="my-2" key={post.id}>
                            <ProjectSummaryUpvotes project={post} />
                        </div>
                    )
                )}
            </div>
        );
    } else if (!(status == Status.NotSubmitted)) {
        postElements = <p className="ms-2">No {type} match your search.</p>;
    }

    return (
        <div>
            <Helmet>
                <title>
                    {query === ""
                        ? "Search " + type + " "
                        : "Search " + type + " for " + query + " "}
                    | {Globals.Title}
                </title>
                <meta
                    name="description"
                    content="Search for project ideas or projects to find inspiration for your next programming project, or request to join a team!"
                ></meta>
            </Helmet>
            <div className="row w-75 mx-auto">
                <select
                    className="form-select col-auto my-auto mx-auto"
                    onChange={changeType}
                    value={type}
                    style={{ width: 125 }}
                >
                    <option value="ideas">Ideas</option>
                    <option value="projects">Projects</option>
                </select>
                <form className="py-4 col" onSubmit={handleSubmit}>
                    <div className="d-flex">
                        <div className="flex-grow-1">
                            <input
                                type="text"
                                value={query}
                                className="form-control"
                                id="title"
                                style={{ minWidth: 125 }}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="ms-2 my-auto">
                            <button
                                className="btn btn-sm btn-secondary"
                                type="submit"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-search"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            {postElements}
            <div className="d-flex">
                <div className="me-auto p-2">
                    {params.page > 1 && (
                        <button
                            type="btn btn-primary"
                            className="btn btn-primary btn-md"
                            onClick={previous}
                        >
                            Previous
                        </button>
                    )}
                </div>
                <div className="p-2">
                    {!lastPage && posts.length > 0 && (
                        <button
                            type="btn btn-primary"
                            className="btn btn-primary btn-md"
                            onClick={next}
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
