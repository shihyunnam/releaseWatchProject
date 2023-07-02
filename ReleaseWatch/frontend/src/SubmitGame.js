import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, renderMatches, Navigate } from "react-router-dom";
import { Outlet, useParams, useLocation, useNavigate } from "react-router-dom";
import { Slide, Zoom } from 'react-slideshow-image';
import './News.css';
import './SubmitGame.css';
import App from './App.js';
import Axios from "axios";

export default function SubmitGame() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [releaseDate, setReleaseDate] = useState(0);
    const [companyName, setCompanyName] = useState('');
    const [companyList, setCompanyList] = useState([]);
    let url = "http://localhost:3002";
    let location = useLocation();
    let navigate = useNavigate();
    let userKey = location?.state?.userKey;
    let isModerator = location?.state?.isModerator;
    let points = location?.state?.points;
    const getCompanyList = () => {
        Axios.get(url + '/api/get/companies').then((response) => {
            setCompanyList(response.data);
            // console.log(response.data);
        })
    }
    const submitGame = () => {
        if (userKey === '') {
          alert("Please log in before making a game submission.");
          navigate('/');
          return;
        }
        // // console.log(name, description, userKey, releaseDate);
        if (name === '' || description === '' || userKey === '' || releaseDate === 0 || companyName === '') {
          alert("please submit valid values and try again.");
          return;
        }
        Axios.post(url + '/api/insert/submission', {
            type: 'game',
            rawData: "'" + name + "','" + description + "','" + companyName + "','" + releaseDate + "'",
            approved: isModerator,
            releaseDate: releaseDate,
            createdBy: userKey
        }).then((e)=> {
            alert("success insert");
            if (!isModerator) {
                navigate('/');
            }
        })
        if (isModerator) {
            Axios.post(url + '/api/insert/game', {
                name: name,
                description: description,
                releaseDate: releaseDate,
                submittedBy: userKey,
                companyName: companyName
            })
            alert("Since you are a moderator, the game was instantly put in the database.");
        }
        navigate('/');
    };

    const goBack = () => {
        navigate('/');
    }

    useEffect(() => {
        getCompanyList();
    }, []);

    return (
    <div className="form">
    <button className='btn' style={{'width': '25%'}} onClick={goBack}>GO BACK</button>
    <h3>Submit a Game</h3>
    <label>Game Name:</label>
    <input type="text" name="name" onChange={(e) => {
      setName(e.target.value);
    }}/>
    <label>Description:</label>
    <input type="text" name="description" onChange={(e) => {
      setDescription(e.target.value);
    }}/>
    <label>Release Date:</label>
    <input type="date" name="releaseDate" onChange={(e) => {
      let time = (Date.parse(e.target.value) + 87000000) / 1000;
      setReleaseDate(time);
    }}/>
    <label>Company:</label>
    <input type="text" name="Companies" list="companyList" onChange={(e) => {
        setCompanyName(e.target.value);
    }}/>
        <datalist id="companyList">
            {companyList.map((company, index) => {
                return (<option value={company.companyName} key={company.companyID}>{company.companyName}</option>)
            })}
        </datalist>
    <button className="btn"  onClick={submitGame}>Submit</button>
  </div>
  );
};