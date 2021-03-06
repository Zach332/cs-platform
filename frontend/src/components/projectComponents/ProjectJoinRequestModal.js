import { useState } from "react";
import axios from "axios";
import { useToasts } from "react-toast-notifications";
import { useLeavePageWarning } from "../hooks/LeavePageWarning";
import Modal from "../layout/Modal";
import { Prompt } from "react-router-dom";

export default function ProjectJoinRequestModal({ project, submitRequest }) {
    const { addToast } = useToasts();
    const [joinRequestMessage, setJoinRequestMessage] = useState("");

    useLeavePageWarning(joinRequestMessage != "");

    const sendJoinRequest = (event) => {
        axios
            .post(
                process.env.REACT_APP_API +
                    "projects/" +
                    project.id +
                    "/joinrequests",
                {
                    requestMessage: joinRequestMessage,
                }
            )
            .then(() => {
                setJoinRequestMessage("");
                submitRequest();
                addToast("Your request was submitted.", {
                    appearance: "success",
                    autoDismiss: true,
                });
            })
            .catch((err) => {
                console.log("Error submitting request: " + err);
                addToast("Your request was not submitted. Please try again.", {
                    appearance: "error",
                });
            });
        event.preventDefault();
    };

    const handleJoinRequestChange = (event) => {
        setJoinRequestMessage(event.target.value);
    };

    const joinRequestForm = (
        <div className="mx-auto">
            <form className="py-4">
                <textarea
                    className="form-control"
                    value={joinRequestMessage}
                    rows="8"
                    placeholder="Enter a message to request to join"
                    onChange={handleJoinRequestChange}
                ></textarea>
            </form>
        </div>
    );

    return (
        <div>
            <Prompt
                when={joinRequestMessage != ""}
                message="You have unsaved changes; are you sure you want to leave?"
            />
            <Modal
                id={"sendJoinRequest" + project.id}
                title={"Send join request to " + project.name}
                body={joinRequestForm}
                submit="Send"
                onClick={sendJoinRequest}
            />
        </div>
    );
}
