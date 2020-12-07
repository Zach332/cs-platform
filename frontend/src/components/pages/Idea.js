import React, { useEffect } from "react";
import Success from "../Success";
import { useParams } from "react-router-dom";
import axios from "axios";
import IdeaCard from "../IdeaCard";
import NotFound from "./NotFound";
import EditIdea from "./EditIdea";
import Comments from "../Comments";
import Modal from "../Modal";
import { useGlobalState, Status } from "../../State";
import { useToasts } from "react-toast-notifications";

export default function Idea() {
    const { addToast } = useToasts();
    const [status, setStatus] = React.useState(Status.Loading);
    const [idea, setIdea] = React.useState([]);
    const [message, setMessage] = React.useState("");
    const [user] = useGlobalState("user");
    let params = useParams();

    useEffect(() => {
        axios.get("/api/ideas/" + params.id).then((response) => {
            if (!response.data) {
                setStatus(Status.NotFound);
            } else {
                setIdea(response.data);
            }
        });
    }, []);

    const deleteIdea = () => {
        axios
            .delete("/api/ideas/" + params.id)
            .then(() => {
                setStatus(Status.Success);
                addToast("Your idea was deleted.", {
                    appearance: "success",
                    autoDismiss: true,
                });
            })
            .catch((err) => {
                console.log("Error deleting idea: " + err);
                addToast("Your idea was not deleted. Please try again.", {
                    appearance: "error",
                });
            });
    };

    const handleMessageChange = (event) => {
        setMessage(event.target.value);
    };

    const sendMessage = () => {
        axios
            .post("/api/messages/" + idea.authorUsername, {
                content: message,
            })
            .then(() => {
                addToast("Your message was sent.", {
                    appearance: "success",
                });
                setMessage("");
            })
            .catch((err) => {
                console.log("Error submitting message: " + err);
                addToast("Your message was not sent. Please try again.", {
                    appearance: "error",
                });
            });
    };

    const edit = () => {
        setStatus(Status.NotSubmitted);
    };

    if (status === Status.NotFound) {
        return <NotFound />;
    }

    if (status === Status.Success) {
        return <Success />;
    }

    if (status === Status.NotSubmitted) {
        return <EditIdea originalIdea={idea} setStatus={setStatus} />;
    }

    let more;
    if (user.username === idea.authorUsername || user.admin) {
        more = (
            <li className="list-group-item">
                <div className="dropdown">
                    <button
                        className="btn btn-secondary dropdown-toggle"
                        type="button"
                        id="dropdownMenuButton"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        More
                    </button>
                    <div
                        className="dropdown-menu"
                        aria-labelledby="dropdownMenuButton"
                    >
                        <a className="dropdown-item" onClick={edit}>
                            Edit idea
                        </a>
                        <a
                            className="dropdown-item text-danger"
                            data-toggle="modal"
                            data-target="#deleteConfirmation"
                        >
                            Delete idea
                        </a>
                    </div>
                </div>
            </li>
        );
    }

    const messageForm = (
        <div className="mx-auto">
            <form className="py-4">
                <textarea
                    className="form-control"
                    id="content"
                    rows="8"
                    placeholder="Your message"
                    onChange={handleMessageChange}
                ></textarea>
            </form>
        </div>
    );

    var date = new Date(idea.timePosted * 1000);
    return (
        <div className="container-fluid">
            <div className="row justify-content-center">
                <div className="col-lg-8 col-md-8 col-sm-auto mb-2">
                    <IdeaCard title={idea.title} content={idea.content} />
                </div>
                <div className="col-md-auto col-sm-auto">
                    <ul className="card list-group list-group-flush">
                        <li className="list-group-item">
                            By {idea.authorUsername}
                            <br></br>on {date.toLocaleDateString()}
                        </li>
                        <li className="list-group-item">
                            <button
                                type="button"
                                data-toggle="modal"
                                data-target="#sendMessage"
                                className="btn btn-outline-secondary btn-md"
                            >
                                Message author
                            </button>
                        </li>
                        <li className="list-group-item">
                            <button
                                type="button"
                                className="btn btn-primary btn-md"
                            >
                                Work on this idea
                            </button>
                        </li>
                        {more}
                    </ul>
                </div>
            </div>
            <div className="row justify-content-center">
                <Comments ideaId={params.id} />
            </div>
            <Modal
                id="deleteConfirmation"
                title="Delete Idea"
                body="Are you sure you want to delete this idea? The data cannot be recovered."
                submit="Delete"
                onClick={deleteIdea}
            />
            <Modal
                id="sendMessage"
                title={"Send message to " + idea.authorUsername}
                body={messageForm}
                submit="Send"
                onClick={sendMessage}
            />
        </div>
    );
}
