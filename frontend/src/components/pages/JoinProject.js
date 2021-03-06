import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Status, useGlobalState } from "../../State";
import NotFound from "./NotFound";
import axios from "axios";
import IdeaSummary from "../ideaComponents/IdeaSummary";
import ProjectSummary from "../projectComponents/ProjectSummary";
import LoginWarning from "./../logins/LoginWarning";
import LoadingDiv from "./../general/LoadingDiv";
import { Helmet } from "react-helmet-async";
import { Globals } from "../../GlobalData";

export default function JoinProject() {
    let history = useHistory();
    const [user] = useGlobalState("user");
    const [idea, setIdea] = useState([]);
    const [rerender, setRerender] = useState(0);
    const [projects, setProjects] = useState([]);
    const [status, setStatus] = useState(Status.Loading);
    let params = useParams();

    useEffect(() => {
        axios
            .get(process.env.REACT_APP_API + "ideas/" + params.id)
            .then((response) => {
                if (!response.data) {
                    setStatus(Status.NotFound);
                } else {
                    setIdea(response.data);
                }
            });
        axios
            .get(
                process.env.REACT_APP_API +
                    "ideas/" +
                    params.id +
                    "/projects?lookingForMembersOnly=true"
            )
            .then((response) => {
                setProjects(response.data);
                setStatus(Status.Loaded);
            });
    }, [rerender]);

    const createProject = () => {
        history.push("/create/idea/" + idea.id);
    };

    if (status === Status.NotFound) {
        return <NotFound />;
    }

    const existingProjects =
        projects.length > 0 ? (
            <div className="mt-4">
                <h4>Existing teams looking for members:</h4>
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
            </div>
        ) : (
            <div className="mt-4">
                No teams are looking for new members right now. Create a new
                one!
            </div>
        );

    if (!user.loggedIn) {
        return <LoginWarning />;
    }

    return (
        <LoadingDiv isLoading={status === Status.Loading}>
            <Helmet>
                <title>Join Project | {Globals.Title}</title>
            </Helmet>
            <h1>Join or start a project for idea:</h1>
            <div className="m-3">
                <IdeaSummary idea={idea} />
            </div>
            <button
                type="button"
                onClick={createProject}
                className="btn btn-primary btn-md mt-3"
            >
                Create new project
            </button>
            {existingProjects}
        </LoadingDiv>
    );
}
