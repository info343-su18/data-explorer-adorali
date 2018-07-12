import React, {Component} from 'react';
import './index.css';
import 'whatwg-fetch';
import moment from 'moment';
import Image from './img/vp-video-editing.jpg'
import {Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap';
import Pagination from "react-js-pagination";


//Sample JSON
// {
//     "copyright": "Jean-Luc DauvergneCiel et Espace",
//     "date": "2018-07-10",
//     "explanation": "It's northern noctilucent cloud season -- perhaps a time to celebrate! Composed of small ice crystals forming only during specific conditions in the upper atmosphere, noctilucent clouds may become visible at sunset during late summer when illuminated by sunlight from below.  Noctilucent clouds are the highest clouds known and now established to be polar mesospheric clouds observed from the ground.  Although observed with NASA's AIM satellite since 2007, much about noctilucent clouds remains unknown and so a topic of active research. The featured time-lapse video shows expansive and rippled noctilucent clouds wafting over Paris, France, during a post-sunset fireworks celebration on Bastille Day in 2009 July.  This year, several locations are already reporting especially vivid displays of noctilucent clouds.",
//     "media_type": "video",
//     "service_version": "v1",
//     "title": "Noctilucent Clouds over Paris Fireworks",
//     "url": "https://www.youtube.com/embed/8i8-IuYoz24?rel=0"
// }

const IMAGES_PER_PAGE = 8;
const EARLIEST_DAY_IMAGE = '1995-06-16';
const URL = 'https://api.nasa.gov/planetary/apod?api_key=EzzKNCDQOcV3fJHd4ab0NQP551lX5ImTaqkZ037e&date=';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            page: 1, // current page

            selectedCard: undefined, // selected picture (selected by click or query)
            json: [], // array of picture objects
            date: moment(), // current date
            totalPictures: moment().diff(EARLIEST_DAY_IMAGE, "days")
        };

    }

    componentDidMount() {
        let currentDate = moment(this.state.date);
        let dates = [];

        // create an array of dates from current date to IMAGES_PER_PAGE days ago
        for (let i = 0; i < IMAGES_PER_PAGE; i++) {
            dates.push(currentDate.year() + "-" + (currentDate.month() + 1) + "-" + currentDate.date());
            currentDate.subtract(1, 'days');
        }


        // set the pictures in our state to be the json object for each date
        Promise.all(dates.map((date) => {
            return fetch(URL + date)
                .then((response) => {
                    return response.json()
                }).catch((err) => {
                    alert(err.message)
                })
        })).then((jsonArr) => {
            this.setState({json: jsonArr});
        })

    }

    cardSelection(selectedCard) {
        this.setState({selectedCard: selectedCard});
    }

    toggleCardSelection() {
        this.setState({selectedCard: undefined});
    }

    handlePageChange(number) {
        let currentDate = this.state.date.clone().subtract(8 * (number - 1), 'days');
        console.log(currentDate.year() + "-" + (currentDate.month() + 1) + "-" + currentDate.date());
        let updatingJSON = [];

        while (updatingJSON.length < 8 && !currentDate.isBefore(EARLIEST_DAY_IMAGE)) {
            updatingJSON.push(currentDate.year() + "-" + (currentDate.month() + 1) + "-" + currentDate.date());
            currentDate.subtract(1, 'days');
        }
        console.log(updatingJSON);
        let promiseArr = updatingJSON.map((date) => {
            return fetch(URL + date).then((response) => {
                console.log(response);
                return response
            })
        });

        Promise.all(promiseArr).then((data) => {
            console.log("before filter", data);
            return data.filter((response) => response.ok === true)
        }).then( (filteredArr) => {
            console.log("filtered array", filteredArr);
            return Promise.all(filteredArr.map(data => data.json())).then(
                (jsonArr) => {this.setState({page:number, json:jsonArr})}
            )
        });



        //promiseArr = promiseArr.filter((promise) => promise.ok);
        //console.log(promiseArr);
        /*.then((promisesArr) => promisesArr.filter((promise) => {
            return promise.ok
        })).then((jsonArr) => jsonArr.map((data) => data.json())).then((jsonArr) => {console.log(jsonArr)})*/

    }

    render() {
        let error = "";
        if (this.state.selectedCard && this.state.selectedCard.code) {
            error = <BadRequestAlert message={this.state.selectedCard.msg}/>;
        }
        return (
            <div>
                <SearchBar selectedCallback={(card) => this.cardSelection(card)}/>
                {error}
                <CardList cards={this.state.json} selectedCallback={(card) => this.cardSelection(card)}/>
                <Pagination
                    activePage={this.state.page}
                    itemsCountPerPage={1}
                    totalItemsCount={Math.ceil(this.state.totalPictures / 8)}
                    pageRangeDisplayed={6}
                    onChange={(number) => {
                        this.handlePageChange(number)
                    }}
                />
                <PopUp card={this.state.selectedCard} toggleCallback={() => {
                    this.toggleCardSelection()
                }}/>
            </div>
        );

    }
}

export default App;

// user must type a valid date in the form YYYY-MM-DD
// props: selectedCallback()- performs selection (pops up in a modal)
class SearchBar extends Component {

    constructor(props) {
        super(props);
        this.state = {value: ""};
    }

    // keeps track of the user input
    handleChange(event) {
        event.preventDefault();
        this.setState({value: event.target.value});
    }

    // requests the user's picture
    handleQuery(event) {
        event.preventDefault();

        // find selection
        let result = fetch(URL + this.state.value)
            .then((response) => {
                return response.json();
            }).catch((error) => {
                console.log("im handling");
                //this.setState({err: error});
            });

        // present it
        return result.then((response) => {
            return this.props.selectedCallback(response);
        }).catch((error) => {
            console.log("im handling");

            //this.setState({err: error});
        });
    }

    render() {
        return <form className="form-inline"
                     onSubmit={(event) => this.handleQuery(event)}>
            <input type="text"
                   value={this.state.value}
                   placeholder="YYYY-MM-DD"
                   className="form-control"
                   onChange={(event) => this.handleChange(event)}/>
            <Button color="light" onClick={(event) => this.handleQuery(event)}>Search!</Button>
        </form>;
    }
}

// props: message - error message
class BadRequestAlert extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: true
        };
    }

    onDismiss() {
        this.setState({visible: false});
    }

    render() {
        return (
            <Alert color="danger" isOpen={this.state.visible} toggle={() => this.onDismiss()}>
                {this.props.message}
            </Alert>
        );
    }
}


// Props(card): json object from NASA
class Card extends Component {
    render() {
        if (this.props.card.media_type === 'video') {
            return (<div className="card" onClick={() => {
                this.props.selectedCallback(this.props.card)
            }}>
                <figure>
                    <img src={Image} alt={this.props.card.title}/>
                    <figcaption>{this.props.card.title}</figcaption>
                </figure>
            </div>);
        } else if (this.props.card.media_type === 'image') {
            return (<div className="card" onClick={() => {
                this.props.selectedCallback(this.props.card)
            }}>
                <figure>
                    <img src={this.props.card.url} alt={this.props.card.title}/>
                    <figcaption>{this.props.card.title}</figcaption>
                </figure>
            </div>);

        }

    }
}

// Props (cards): Array of json objects from NASA
class CardList extends Component {
    render() {
        let listOfCards = this.props.cards.map((card) => {
                return <Card key={card.date} card={card} selectedCallback={this.props.selectedCallback}/>
            }
        );
        return (<section className="spread">{listOfCards}</section>);
    }
}


// props(card: the card, callback function: to toggle the state of App to make sure it becomes undefined once you close the modal)
class PopUp extends Component {

    render() {

        // If the card is undefined return nothing
        if (this.props.card === undefined || this.props.card.code) {
            return <div></div>;
        }

        // else create the modal
        return (
            <div>{
                <Modal isOpen={this.props.card !== undefined} toggle={() => {
                    this.props.toggleCallback()
                }} className={"Chocho"}>
                    {/*Header*/}
                    <ModalHeader toggle={() => {
                        this.props.toggleCallback()
                    }}>{this.props.card.title}</ModalHeader>

                    {/*Body, here it goes the image and the descriptions*/}
                    <ModalBody>{this.props.card.media_type === 'video' ?
                        <figure>
                            <iframe width="420" height="315"
                                    src={this.props.card.url}>
                            </iframe>
                            {this.props.card.copyright && <figcaption>{this.props.card.copyright}</figcaption>}
                        </figure>
                        :
                        <figure>
                            <img src={this.props.card.url}/>
                            {this.props.card.copyright && <figcaption>{this.props.card.copyright}</figcaption>}
                        </figure>}
                        <p>{this.props.card.explanation}</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => {
                            this.props.toggleCallback()
                        }}>Cancel</Button>
                    </ModalFooter>
                </Modal>}
            </div>
        );
    }
}
