import React, {useEffect, useState} from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Outlet, useParams, useLocation } from "react-router-dom";
import { Slide, Zoom } from 'react-slideshow-image';
import './Game.css';
import App from './App.js';
import Axios from "axios";
import News from './News.js';
export default function Game(props) {
    const url = "http://localhost:3002";
    const [gameInfo, setGameInfo] = useState('');
    const [artworkArray, setArtworkArray] = useState([]);
    const [screenshotArray, setScreenshotArray] = useState([]);
    const [avgColor, setAvgColor] = useState('#555');
    const [brightness, setBrightness] = useState(false);
    const [news, setNews] = useState([]);
    let darkerColor = avgColor;
    let lighterColor = avgColor + "aa";
    const getInfo = (id) => {
        Axios.post(url + '/api/post/games/id/', {
          queryID: id
        }).then((response) => {
          setGameInfo(response.data);
        })
    }
    const getAvgColor = (link) => {
        Axios.post(url + '/api/avgcolor/', {
            url: link
        }).then((response) => {
            // // console.log(response);
            setAvgColor(response.data.hex);
            setBrightness(response.data.isLight);
        })
    }

    const getNews = (id) => {
        Axios.post(url + '/api/post/get_news', {
            gameID: id
        }).then((response) => {
            setNews(response.data);
        })
    }

    const getArtworks = (id) => {
        Axios.post(url + '/api/post/artwork/', {
          gameID: id
        }).then((response) => {
            // // console.log(response);
          if (response.data.length > 0) {
            setArtworkArray([response.data]);
            getAvgColor("https://" + response.data[0].url.substr(2).replace("t_thumb", "t_screenshot_big"));
          } else {
            Axios.post(url + '/api/post/screenshots/', {
                gameID: id
            }).then((response) => {
                if (response.data.length > 0) {
                    setArtworkArray([response.data]);
                    getAvgColor("https://" + response.data[0].url.substr(2).replace("t_thumb", "t_screenshot_big"));
                } else {
                    alert('could not find artwork or screenshots for game');
                }
            })
          }
        })
        // // console.log(artworkArray);
      }

    const getScreenshots = (id) => {
        Axios.post(url + '/api/post/screenshots/', {
            gameID: id
        }).then((response) => {
            // // console.log(response);
            if (response.data.length > 0) {
                setScreenshotArray([response.data]);
            }
    })
        // // console.log(screenshotArray);
    }
    const newsCard = (<div className="news-card">
        <p>{gameInfo[0]?.submittedBy}</p>
        <h2>RTX COMPATIBILITY ANNOUNCED</h2>
        <p>{gameInfo[0]?.description}</p>
    </div>);
      
    const Slideshow = () => {
        let purls = ['unknown.jpg'];
        if (screenshotArray[0]?.length > 0) {
            purls.pop();
        }
        screenshotArray[0]?.map((slideImage, index)=> (
            purls.push("https://" + slideImage.url.substr(2).replace("t_thumb", "t_screenshot_big"))
        ))
        // // console.log(purls);
        return (
        <div className="slide-container">
            <Zoom autoplay={false} easing={"ease"} transitionDuration={500} scale={2} indicators={true}>
            {purls.map((slideImage, index)=> (
                // // console.log(slideImage.url),
                <div className="each-slide-effect" key={index}>
                    <div style={{'backgroundImage': `url(${purls[index]})`}}>
                    </div>
                </div>
            ))} 
            </Zoom>
        </div>);
    }
    let params = useParams();
    let location = useLocation();
    let userKey = location?.state?.key;
    let isModerator = location?.state?.mod;
    let points = location?.state?.points;
    useEffect(() => {
        // console.log(location?.state);
        getInfo(params.id);
        getArtworks(params.id);
        getScreenshots(params.id);
        getNews(params.id);
    }, []);
    return (
        <main style={{'color': brightness ? 'black' : 'white'}}>
            <body className="Game" style={{'background-color': lighterColor}}>
                <Link to="/" state={{key: userKey, mod: isModerator, points: points}}>
                    <button className="btn" style={{'background-color': darkerColor, 'font-size': '32px', 'padding': '16px 32px;'}}>Home</button>
                    <Routes>
                        <Route path="/" element={<App/>} />
                    </Routes>
                </Link>
                <div className="game-header">
                    <img src={artworkArray[0] ? "https://" + artworkArray[0][0]?.url.substr(2).replace("t_thumb", "t_screenshot_big") : '../unknown.jpg'}></img>
                    <div className="game-news" style={{'background-color': darkerColor}}>
                        <h1>NEWS</h1>
                        {news?.map((news, index) => {
                            return (<div className='news-card'>
                                <p>{news?.submittedBy ? news?.submittedBy : 'Anonymous'}</p>
                                <h2>{news?.text?.split('|')[0]}</h2>
                                <p>{news?.text?.split('|')[1]}</p>
                                <br></br>
                                <hr style={{'borderBottom': '6px', 'borderColor': brightness ? darkerColor : lighterColor, 'content': 'A'}}/>
                                <br></br>
                            </div>)
                        })}
                        <hr hidden={news.length !== 0} style={{'borderBottom': '6px', 'borderColor': brightness ? darkerColor : lighterColor, 'content': 'A'}}/>
                        <br></br>
                        <p>{news.length === 0 ? "No news yet 😔" : ""}</p>
                    </div>
                    <div className="game-title">
                        <h1>{gameInfo[0]?.name}</h1>
                        <div style={{'padding-left':'1rem'}}>
                            <Link to={"/news/" + params.id} state={{key: userKey, title: gameInfo[0]?.name, mod: isModerator, points: points, url: artworkArray[0] ? "https://" + artworkArray[0][0]?.url.substr(2).replace("t_thumb", "t_screenshot_big") : ''}}>
                                <button className="btn" style={{'background-color': darkerColor, 'font-size': '32px', 'padding': '16px 32px'}}>SUBMIT NEWS</button>
                                <Routes>
                                    <Route path={"/news/" + params.id} element={<News/>}/>
                                </Routes>
                            </Link>
                        </div>
                    </div>
                    <div className="game-info">
                        <h2 className="game-info-text"><b>Releases:</b> {new Date(gameInfo[0]?.releaseDate * 1000).toDateString()}</h2>
                        <h2 className="game-info-text"><b>Submitted By:</b> {gameInfo[0]?.submittedBy}</h2>
                        <h2 className="game-info-text"><b>Involved Companies:</b> {}</h2>
                    </div>
                </div>
                <div className="slideshow-parent">
                    <h1>Screenshots</h1>
                    {Slideshow()}
                </div>
            </body>
        </main>
    );
};