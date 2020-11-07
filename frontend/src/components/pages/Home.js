import React, { useEffect } from 'react'
import IdeaSummary from './../IdeaSummary'
import axios from 'axios'

export default function Home() {
    const [ideas, setIdeas] = React.useState([])

    useEffect(() => {
        axios.get("/api/ideas").then((response) => {
            setIdeas(response.data)
        })
    },[])

    const onCLick = () => {
        window.location.href = '/new-idea'
    }

    return (
        <div>
            <h1>Home</h1>
            <div className="text-right">
                <button type="btn btn-primary" onClick={onCLick} className="btn btn-outline-primary btn-lg pull-right">
                    <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-plus" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                    </svg>
                    New Idea
                </button>
            </div>
            {ideas.map(idea => <IdeaSummary key={idea.id} idea={idea} />)}
        </div>
    )
}