import React from 'react'
import axios from 'axios'
import CheckMark from "../../check.svg"

export default function NewIdea() {
    const [idea, setIdea] = React.useState([{ title: '' , content: ''}])
    const [submitted, setSubmitted] = React.useState(false)

    const handleInputChange = (event) => {
        const target = event.target;
        const name = target.id;
        setIdea(
            idea => ({
                ...idea,
                [name]: target.value
            })
        );
    }

    const handleSubmit = (event) => {
        axios.post("/api/ideas", {
            authorUsername: 'Seg Fault',
            title: idea.title,
            content: idea.content
        })
        setSubmitted(true)
        event.preventDefault()
    }

    if(!submitted) {
        return (
            <div className="mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input type="text" className="form-control" id="title" onChange={handleInputChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="content">Details</label>
                        <textarea className="form-control" id="content" rows="3" onChange={handleInputChange}></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Post Idea</button>
                </form>
            </div>
        )
    } else {
        return (
            <div>
                <img src={CheckMark} class="mx-auto d-block pt-4" alt="Successful login" />
            </div>
        )
    }
}
