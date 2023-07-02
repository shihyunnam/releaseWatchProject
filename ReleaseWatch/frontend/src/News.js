import React, {useEffect, useState} from "react";
import { BrowserRouter, Routes, Route, Link, renderMatches } from "react-router-dom";
import { Outlet, useParams, useLocation, useNavigate } from "react-router-dom";
import { Slide, Zoom } from 'react-slideshow-image';
import './News.css';
import App from './App.js';
import Axios from "axios";
export default function News () {

    let navigate = useNavigate();
    
    const [inputs, setInputs] = useState({});
    const [textarea, setTextarea] = useState(
        "The content of a textarea goes in the value attribute"
    );

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    }

    const handleTextAreaChange = (event) => {
        setTextarea(event.target.value);
    }

    let params = useParams();
    let location = useLocation();
    let id = params.id;
    const url = "http://localhost:3002";
    const submitNews = (event) => {
        event.preventDefault();
        if (!location.state.key) {
            alert('You are not logged in. Please return to the homepage and log in.');
            return;
        }
        if (inputs.subject === '' || textarea === '') {
            alert("Subject or Body field is empty.");
            return;
        }
        Axios.post(url + '/api/post/news', {
            id: id,
            user: location.state.key,
            text: inputs.subject + "|" + textarea
        })
        alert("News submitted successfully!");
        navigate("/game/" + id);
    }
    return (
            <div className="main-container" style={{'backgroundImage': `url(${location.state.url})`, 'backgroundSize': 'cover', 'minHeight': '100%'}}>
                <div className="form-container">
                <Link to="/" state={{key: location.state.key, mod: location.state.mod, points: location.state.points}}>
                        <button className="btn" style={{'background-color': '#222', 'font-size': '32px', 'padding': '16px 32px;', 'padding-top': '-50px'}}>Home</button>
                        <Routes>
                            <Route path="/" element={<App/>} />
                        </Routes>
                </Link>
                    <p>{location.state.key ? location.state.key : ''}</p>
                    <h1>Create News Post for {location.state.title}</h1>
                    <form onSubmit={submitNews}>
                        <label>Subject:
                            <input id="input" type="text" name="subject" value={inputs.subject || ""} onChange={handleChange} maxLength={250}/>
                        </label>
                        <label>Body:
                            <textarea value={textarea} onChange={handleTextAreaChange} maxLength={1748}/>
                        </label>
                        <input id="input" type="submit"/>
                    </form>
                </div>
            </div>
    )
}