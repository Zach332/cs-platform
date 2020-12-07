import React from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useToasts } from "react-toast-notifications";

export default function Message({ message, setRerender }) {
    const { addToast } = useToasts();
    const deleteMessage = () => {
        axios
            .delete("/api/messages/" + message.id)
            .then(() => {
                addToast("The message was deleted.", {
                    appearance: "success",
                    autoDismiss: true,
                });
                setRerender((rerender) => rerender + 1);
            })
            .catch((err) => {
                console.log("Error deleting message: " + err);
                addToast("The message was not deleted. Please try again.", {
                    appearance: "error",
                });
            });
    };

    return (
        <motion.div
            layout
            className="list-group-item flex-column align-items-start my-2 rounded border"
        >
            <div className="dropdown">
                <button
                    className="btn btn-sm btn-outline-secondary float-right"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                >
                    <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 16 16"
                        className="bi bi-three-dots-vertical"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"
                        />
                    </svg>
                </button>
                <div
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                >
                    <a
                        className="dropdown-item text-danger"
                        onClick={deleteMessage}
                    >
                        Delete message
                    </a>
                </div>
            </div>
            <h6 className="card-subtitle my-2">
                From {message.senderUsername}
            </h6>
            <p className="mb-1 ml-2" style={{ "white-space": "pre" }}>
                {message.content}
            </p>
        </motion.div>
    );
}
