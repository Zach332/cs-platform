import React, { useEffect } from "react";
import axios from "axios";
import { Status, useGlobalState } from "../../State";
import { toParams, toQuery } from "../utils/Routing";
import LoadingDiv from "./../general/LoadingDiv";
import { Helmet } from "react-helmet";
import { Globals } from "../../GlobalData";
import ProjectSummary from "./../projectComponents/ProjectSummary";
import { useHistory, useLocation } from "react-router-dom";

export default function Projects() {
    let location = useLocation();
    let history = useHistory();
    const [user] = useGlobalState("user");
    const [rerender, setRerender] = React.useState(0);
    const [projects, setProjects] = React.useState([]);
    const [status, setStatus] = React.useState(Status.Loading);
    const [lastPage, setLastPage] = React.useState(true);
    const params = toParams(location.search.replace(/^\?/, ""));
    if (!params.page) params.page = 1;

    useEffect(() => {
        setStatus(Status.Loading);
        axios
            .get("/api/projects?" + toQuery({ page: params.page }))
            .then((response) => {
                setProjects(response.data.projectPreviews);
                setLastPage(response.data.lastPage);
                setStatus(Status.Success);
            });
    }, [location, rerender]);

    const goToMyProjects = () => {
        history.push("/my-projects");
    };

    const next = () => {
        history.push(
            "/projects?" + toQuery({ page: parseInt(params.page) + 1 })
        );
    };

    const previous = () => {
        history.push(
            "/projects?" + toQuery({ page: parseInt(params.page) - 1 })
        );
    };

    return (
        <div>
            <Helmet>
                <title>Projects | {Globals.Title}</title>
            </Helmet>
            <div className="d-flex align-items-center">
                <div className="me-auto p-2">
                    <h1>Projects</h1>
                </div>
                {user.loggedIn && (
                    <div className="p-2">
                        <button
                            onClick={goToMyProjects}
                            className="btn btn-secondary btn-md"
                        >
                            My Projects
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-arrow-90deg-right ms-1"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M14.854 4.854a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 4H3.5A2.5 2.5 0 0 0 1 6.5v8a.5.5 0 0 0 1 0v-8A1.5 1.5 0 0 1 3.5 5h9.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4z"
                                />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
            <LoadingDiv isLoading={status == Status.Loading}>
                <div className="container mx-auto">
                    {projects.map((project) => (
                        <div className="my-2" key={project.id}>
                            <ProjectSummary
                                project={project}
                                setRerender={setRerender}
                            />
                        </div>
                    ))}
                </div>
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
                        {!lastPage && projects.length > 0 && (
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
            </LoadingDiv>
        </div>
    );
}
