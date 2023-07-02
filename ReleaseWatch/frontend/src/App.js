import React, {useEffect, useState} from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import Game from "./Game.js";
import Axios from 'axios';
import './App.css';

function App() {
  let params = useParams();
  const [query, setQuery] = useState('');
  const [displayQuery, setDisplayQuery] = useState('Upcoming Games as of ' + new Date().toDateString().slice(4));
  const [username, setUserName] = useState('');
  const [rUsername, setRUserName] = useState('');
  const [userKey, setUserKey] = useState('');
  const [points, setUserPoints] = useState('');
  const [isEditing, setEditing] = useState(false);
  const [isModerator, setModerator] = useState(0);
  const [password, setPassword] = useState('');
  const [rPassword, setRPassword] = useState('');
  const [gamesList, setGamesList] = useState([]);
  const [hotList, setHotList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [bestCompanies, setBestCompanies] = useState([]);
  const [submissionList, setSubmissionList] = useState([]);
  const [minYear, setMinYear] = useState([2000]);
  const [maxYear, setMaxYear] = useState([2010]);
  const [artworkArray, setArtworkArray] = useState([]);

  const url = "http://localhost:3002"

  let location = useLocation();

  const editGame = (id, name, desc) => {
    // // console.log(id, name, desc);
    Axios.post(url + '/api/post/update/games/', {
      id: id,
      name: name, 
      description: desc
    }).then((response) => {
      // // console.log(response);
      alert("Game " + id + " updated successfully!");
    })
  }

  const getGames = () => {
    // // console.log("frontend games refresh");
    Axios.get(url + '/api/get/games/').then((response) => {
      // // console.log(response);
      setGamesList(response.data);
    });
  }

  const getCompanyName = (c_id) => {
    // console.log(c_id);
    Axios.post(url + '/api/post/companies/id', {
      companyID: c_id
    }).then((response) => {
      // console.log(response);
      return response.data;
    })
  }

  const getBestCompanies = () => {
    Axios.get(url + '/api/get/best_companies').then((response) => {
      setBestCompanies(response.data);
      // console.log(response.data);
    })
  }

  const getMostAnticipated = () => {
    Axios.get(url + '/api/get/most_anticipated/').then((response) => {
      // console.log(response);
      setHotList(response.data[0]);
    })
  }

  const getTrendingUsers = () => {
    // // console.log("frontend games refresh");
    Axios.get(url + '/api/get/trending_users/').then((response) => {
      // // console.log(response);
      setUserList(response.data);
    })
  }

  const getSubmissions = () => {
    Axios.get(url + '/api/get/submissions').then((response) => {
      setSubmissionList(response.data);
    })
  }

  const login = () => {
    Axios.post(url + '/api/post/login/', {
      username: username,
      password: password
    }).then((response) => {
      if (response.data.length === 0) {
        alert('wrong username or password!');
        return;
      } else {
        setUserKey(response.data[0].username);
        setUserPoints(response.data[0].points);
        setModerator(response.data[0].isModerator);
        setUserName("");
        setPassword("");
      }
    })
  }

  const register = () => {
    Axios.post(url + '/api/post/register/', {
      username: rUsername,
      password: rPassword
    }).then((response) => {
      alert(rUsername + " has been successfully registered!")
      // // console.log(response);
      setRUserName("");
      setRPassword("");
    })
  }

  const logOut = () => {
    setUserKey("");
    setUserPoints("");
    setModerator(0);
    location.state.key = null;
    location.state.points = null;
    location.state.mod = null;
    window.history.replaceState({}, document.title);
  }

  const searchGames = () => {
    setDisplayQuery('Results for "' + query +'"')
    // // console.log("searching " + query.toString());
    Axios.post(url + '/api/post/search/games/', {
      query: query.toString()
    }).then((response) => {
      // // console.log(response);
      if (response.data.length === 0) {
        alert('no results');
        return;
      }
      setGamesList(response.data);
    })
  }

  const deleteGame = (gameID) => {
    // // console.log(gameID);
    Axios.post(url + '/api/post/delete/games/', {
      id: gameID
    }).then((response) => {
      // // console.log(response);
      getGames();
    })
  }

  const deleteSubmission = (submissionID) => {
    // // console.log(gameID);
    Axios.post(url + '/api/delete/submission/', {
      id: submissionID
    }).then((response) => {
      // // console.log(response);
      getSubmissions();
    })
  }

  const approveSubmission = (submissionID, submissionType, rawData, approved, submittedBy, submitDate) => {
    // // console.log(gameID);
    Axios.post(url + '/api/update/submission/', {
      submissionID: submissionID,
      type: submissionType,
      rawData: rawData,
      approved: approved,
      submittedBy: submittedBy,
      submitDate: submitDate
    }).then((response) => {
      // // console.log(response);
      getSubmissions();
    })
  }

  const refreshStats = () => {
    getGames();
    getMostAnticipated();
    getTrendingUsers();
  }

  const debugLogin = () => {
    setUserKey("HardcoreSwagger");
    setUserPoints(42069);
    setModerator(1);
  }

  useEffect(() => {
    // console.log(location.state);
    setMinYear(2000);
    setMaxYear(2010);
    getGames(); // load games once at the start of page
    getMostAnticipated();
    getTrendingUsers();
    getSubmissions();
    if (location?.state?.key != null) {
      setUserKey(location.state.key);
    }
  
    if (location?.state?.mod != null) {
      setModerator(location.state.mod);
    }
  
    if (location?.state?.points != null) {
      setUserPoints(location.state.points);
    }
    getBestCompanies();
  }, []);

  return (
    <div className="App">
      <h1 className="main-title">ReleaseWatch</h1>
      <Link to="/submit/game" state={{userKey: userKey, isModerator: isModerator, points: points}}>
        <button className="btn" style={{'textAlign': 'center', 'position': 'relative', 'fontSize': '32px'}}>SUBMIT A GAME</button>
          <Routes>
            <Route path="/submit/game"/>
          </Routes>
      </Link>
      <div className='user-info' style={{
          display: userKey === '' ? 'none' : 'block'
        }}>
        <p>You are currently logged in as <b>{userKey}</b>. You have <b>{points}</b> points. <button  className="btn" onClick={logOut}>log out</button></p>
      </div>
      <div className="login section-title" style={{'float': 'right', 'display': userKey === '' ? 'block' : 'none'}} hidden={!userKey.length === 0}>
        <div className='sub-login'>
          <h3>Log In</h3>
          <label>Username <input id="cred-field" type="text" onChange={(e) => {
            setUserName(e.target.value);
          }} value={username}/></label>
          <label>Password <input id="cred-field" type="password" onChange={(e) => {
            setPassword(e.target.value);
          }} value={password}/></label>
          <button className="btn"  onClick={login}>Log in</button>
          <button className="btn" onClick={debugLogin}>Debug Login</button>
        </div>
        <div className='sub-login'>
          <h3>Register</h3>
          <label>Username <input id="cred-field" type="text" onChange={(e) => {
            setRUserName(e.target.value);
          }} value={rUsername}/></label>
          <label>Password <input id="cred-field" type="password" onChange={(e) => {
            setRPassword(e.target.value);
          }} value={rPassword}/></label>
          <button className="btn" onClick={register}>Register</button>
        </div>
      </div>
      <h1 className="section-title">🔥Most Anticipated Games🔥</h1>
      <div className="hot-games">
        {hotList.map((val, index) => {
          if (index > 7) {
            return;
          }
          let d = new Date(val.releaseDate * 1000).toDateString().slice(4);
          let card = (<Link to={"/game/" + val.gameID} key={val.gameID} state={{key: userKey, mod: isModerator, points: points}} style={{'text-decoration': 'none', 'color': 'black'}}>
            <div className = "hot-card" key={val.gameID} style={{backgroundColor: isEditing ? "white" : "lightcoral"}}>
          <p>{val.gameID}</p>
          <h2>{val.name}</h2>
          <p>{val.description}</p>
          <p><b>Release Date:</b> {d}</p>
          <p><b>Submitted By:</b> {val.submittedBy}</p>
          <Routes>
            <Route path={"/game/" + val.gameID} element={<Game/>}/>
          </Routes>
        </div></Link>)
          let modCard = (<div className = "hot-card" key={val.gameID} style={{backgroundColor: isEditing ? "white" : "lightcoral"}}>
          <h2 contentEditable={isEditing} suppressContentEditableWarning={true} onInput={e => val.name = e.currentTarget.textContent}>{val.name}</h2>
          <p contentEditable={isEditing} suppressContentEditableWarning={true} onInput={e => val.description = e.currentTarget.textContent}>{val.description}</p>
          <p><b>Release Date:</b> {d}</p>
          <p><b>Submitted By:</b> {val.submittedBy}</p>
          <Link to={"/game/" + val.gameID} key={val.gameID} state={{key: userKey, mod: isModerator, points: points}} style={{'text-decoration': 'none', 'color': 'black'}}>
            <button className="btn"><b>VISIT</b></button>
            <Routes>
              <Route path={"/game/" + val.gameID} element={<Game id={{id: val.gameID, userKey: {userKey}, isModerator: {isModerator}}}/>}/>
            </Routes>
          </Link>
          <button className="btn"  onClick={() => {setEditing(!isEditing)}}><b>EDIT</b></button>
          <button className="btn"  onClick={() => {
            deleteGame(val.gameID)
          }}><b>DELETE</b></button>
          <button className="btn"  onClick={() => {
              setEditing(!isEditing)
              editGame(val.gameID, val.name, val.description)
            }} hidden={!isEditing} disabled={!isEditing}><b>CONFIRM</b></button>
          </div>)
          if (isModerator === 1) {
            return modCard;
          } else {
            return card;
          }
        })}
      </div>
      <br></br>
      <img src="https://i.gifer.com/74H8.gif" style={{'display': bestCompanies[0]?.length > 0 ? 'none' : 'block'}} height="50px" width="50px"/>
      <h1 className="section-title" style={{'display': bestCompanies[0]?.length > 0 ? 'block' : 'none'}}>SPECIAL STATS OF THE WEEK:</h1>
      <div className="stats-container" style={{'display': bestCompanies[0]?.length > 0 ? 'inline-flex' : 'none'}}>
        <div className="stats section-title">
          <table>
            <h3>Contributing Users With Below Average Points</h3>
            <tbody>
              <tr>
                <th>Username</th>
                <th>Game Submitted</th>
                <th>Points</th>
              </tr>
              {userList.map((val, i) => {
                let table = (<tr key={i}>
                  <td>{val.submittedBy}</td>
                  <td>{val.name}</td>
                  <td>{val.points}</td>
                </tr>)
                return table;
              })}
            </tbody>
          </table>
        </div>
        <div className="stats section-title">
        <table style={{'float':'right'}}>
            <h3>Best Companies Graded</h3>
            <tbody>
              <tr>
                <th>Company Name</th>
                <th>Company Size</th>
                <th>Rating</th>
                <th>Points</th>
              </tr>
              {bestCompanies[0]?.map((val, i) => {
                // // console.log(val.companyID);
                let table = (<tr key={i}>
                  <td>{val.companyName}</td>
                  <td>{val.companySize}</td>
                  <td>{val.Rating}</td>
                  <td>{val.score}</td>
                </tr>)
                return table;
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="section-title">
        <label style={{'fontSize':'24px'}}>Search All Games:
          <input id="search-box" type="text" style={{'margin-top': '12px'}} onChange={(e) => {
            setQuery(e.target.value);
          }}></input>
        </label>
        <button className="btn" onClick={searchGames}>Search</button>
      </div>
      <div className='games'>
        <div className="submission-container">
        <h1 className="section-title" hidden={!isModerator}>Submissions</h1>
        {submissionList?.map((val) => {
          // console.log(val);
          let d = new Date(val.submitDate * 1000).toDateString().slice(4);
          let parsed_data = val.rawData.replaceAll("'", "").split(',');
          let rd = new Date(parseInt(parsed_data[3]) * 1000).toDateString().slice(4);
          // console.log(parsed_data)
          let card = <div className="card" style={{'backgroundColor': 'lightcoral'}}>
            <p>Submission #{val.submissionID} ({val.submissionType})</p>
            <h2>{parsed_data[0]}</h2>
            <p>{parsed_data[1]}</p>
            <p><b>Release Date: </b>{rd}</p>
            <p><b>Submitted By:</b> {val.createdBy}</p>
            <p><b>Submitted:</b> {d}</p>
            <button className="btn"  onClick={() => {
              approveSubmission(val.submissionID, val.submissionType, val.rawData, 1, val.createdBy, val.submitDate);
            }}><b>APPROVE</b></button>
            <button className="btn"  onClick={() => {
              deleteSubmission(val.submissionID)
            }}><b>DELETE</b></button>
          </div>
          if (isModerator) return (
            card
          )
        })}
      </div>
      <h1 className="section-title">{displayQuery}</h1>
        {gamesList.map((val) => {
          let d = new Date(val.releaseDate * 1000).toDateString().slice(4);
          let card = (<Link to={"/game/" + val.gameID} key={val.gameID} state={{key: userKey, mod: isModerator, points: points}} style={{'text-decoration': 'none', 'color': 'black'}}>
            <div className = "card" key={val.gameID} style={{backgroundColor: isEditing ? "white" : "lightcoral"}}>
          <p>{val.gameID}</p>
          <h2>{val.name}</h2>
          <p>{val.description}</p>
          <p><b>Release Date:</b> {d}</p>
          <p><b>Submitted By:</b> {val.submittedBy}</p>
          <Routes>
            <Route path={"/game/" + val.gameID} element={<Game/>}/>
          </Routes>
        </div></Link>)
          let modCard = (<div className = "card" key={val.gameID} style={{backgroundColor: isEditing ? "white" : "lightcoral"}}>
          <h2 contentEditable={isEditing} suppressContentEditableWarning={true} onInput={e => val.name = e.currentTarget.textContent}>{val.name}</h2>
          <p contentEditable={isEditing} suppressContentEditableWarning={true} onInput={e => val.description = e.currentTarget.textContent}>{val.description}</p>
          <p><b>Release Date:</b> {d}</p>
          <p><b>Submitted By:</b> {val.submittedBy}</p>
          <Link to={"/game/" + val.gameID} key={val.gameID} state={{key: userKey, mod: isModerator, points: points}} style={{'text-decoration': 'none', 'color': 'black'}}>
            <button className="btn"><b>VISIT</b></button>
            <Routes>
              <Route path={"/game/" + val.gameID} element={<Game id={{id: val.gameID, userKey: {userKey}, isModerator: {isModerator}}}/>}/>
            </Routes>
          </Link>
          <button className="btn"  onClick={() => {setEditing(!isEditing)}}><b>EDIT</b></button>
          <button className="btn"  onClick={() => {
            deleteGame(val.gameID)
          }}><b>DELETE</b></button>
          <button className="btn"  onClick={() => {
            setEditing(!isEditing)
            editGame(val.gameID, val.name, val.description)
          }} disabled={!isEditing}><b>CONFIRM</b></button>
        </div>)
      if (isModerator === 1) {
        return modCard;
      } else {
        return card;
      }
          })}
      </div>
    </div>
  );
}

export default App;

// npm start