import React, {Component} from 'react';
import './index.css';
import 'whatwg-fetch';
import moment from 'moment';
import Image from './img/vp-video-editing.jpg'
import {Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import Pagination from "react-js-pagination";


//Sample JSON:
// {
//     "copyright": "Jean-Luc DauvergneCiel et Espace",
//     "date": "2018-07-10",
//     "explanation": "It's northern noctilucent cloud season -- perhaps a time to celebrate! Composed of small ice crystals forming only during specific conditions in the upper atmosphere, noctilucent clouds may become visible at sunset during late summer when illuminated by sunlight from below.  Noctilucent clouds are the highest clouds known and now established to be polar mesospheric clouds observed from the ground.  Although observed with NASA's AIM satellite since 2007, much about noctilucent clouds remains unknown and so a topic of active research. The featured time-lapse video shows expansive and rippled noctilucent clouds wafting over Paris, France, during a post-sunset fireworks celebration on Bastille Day in 2009 July.  This year, several locations are already reporting especially vivid displays of noctilucent clouds.",
//     "media_type": "video",
//     "service_version": "v1",
//     "title": "Noctilucent Clouds over Paris Fireworks",
//     "url": "https://www.youtube.com/embed/8i8-IuYoz24?rel=0"
// }

// Images displayed per page
const IMAGES_PER_PAGE = 8;

// Earliest image provided by nasa
const EARLIEST_DAY_IMAGE = '1995-06-16';

// Today's date
const DATE = moment();

// api retrieval address
const URL = 'https://api.nasa.gov/planetary/apod?api_key=osdVyi5XiDFoWNxvHZHTCevykMscwRdCYdux3CyF&hd=true&date=';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            page: 1, // current page
            picturesNewToOld: true,
            selectedCard: undefined, // selected picture (selected by click or query)
            json: [], // array of picture objects
            totalPictures: moment().diff(EARLIEST_DAY_IMAGE, "days")
        };

    }

    // LIFE CYCLE METHODS ------------------


    // Fetching data from the API.
    componentDidMount() {
        let currentDate = moment(DATE);
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
    /* This is called in order to scroll up at the top of the page for every time the App renders */
    componentDidUpdate() {
        window.scrollTo(0,0);
    }



    // CALL BACK FUNCTIONS ------------------

    // Newest to oldest call back. Variable, bool: true for new to old, false for old to new,
    makeChrono(newToOld) {
        this.setState({picturesNewToOld: newToOld, page: 1}, () => {this.handlePageChange(1)});
    }

    // To select a card and bring it up to APP
    cardSelection(selectedCard) {
        this.setState({selectedCard: selectedCard});
    }

    // Toggle card selection. The reason is to show the pop up.
    toggleCardSelection() {
        this.setState({selectedCard: undefined});
    }

    // Handle the page. Takes in the page number.
    handlePageChange(number) {
        let currentDate = "";
        if (this.state.picturesNewToOld) {
            currentDate = DATE.clone().subtract(IMAGES_PER_PAGE * (number - 1), 'days');
        } else {
            currentDate = moment(EARLIEST_DAY_IMAGE).add(IMAGES_PER_PAGE * (number - 1), 'days');
        }
        
        let updatingJSON = []; // the array to be processed and ocnverted to array

        // Adding all the dates into the updating JSON array.
        while (updatingJSON.length < IMAGES_PER_PAGE && !currentDate.isBefore(EARLIEST_DAY_IMAGE) && !currentDate.isAfter(DATE)) {
            updatingJSON.push(currentDate.year() + "-" + (currentDate.month() + 1) + "-" + currentDate.date());
            if (this.state.picturesNewToOld) {
                currentDate.subtract(1, 'days');
            } else {
                currentDate.add(1, 'days');
            }
            
        }

        // Fetching data
        let promiseArr = updatingJSON.map((date) => {
            return fetch(URL + date).then((response) => {
                return response;
            });
        });

        // Waiting for all the data to fetch
        Promise.all(promiseArr).then((data) => {
            // Filter those responses that doesn't work. Some of the dates won't have pictures.
            return data.filter((response) => response.ok === true)
        }).then((filteredArr) => {

            // With the filtered array, we convert the promises to json files.
            Promise.all(filteredArr.map(data => data.json())).then(
                (jsonArr) => {
                    // Set state
                    this.setState({page: number, json: jsonArr})
                }
            )
        });
    }


    render() {
        let error = "";
        if (this.state.selectedCard && this.state.selectedCard.code) {
            error = <BadRequestAlert message={this.state.selectedCard.msg}/>;
        }
        return (
            <div>
                <SearchBar selectedCallback={(card) => this.cardSelection(card)} 
                            makeChrono={(bool) => this.makeChrono(bool)}/>
                {error}
                <CardList cards={this.state.json} selectedCallback={(card) => this.cardSelection(card)}/>
                <Pagination
                    activePage={this.state.page}
                    hideDisabled
                    activeLinkClass={"activelink"}
                    linkClass={"navlinks"}
                    nextPageText={">"}
                    lastPageText={">>"}
                    prevPageText={"<"}
                    firstPageText={"<<"}
                    itemsCountPerPage={1}
                    totalItemsCount={Math.ceil(this.state.totalPictures / IMAGES_PER_PAGE)}
                    pageRangeDisplayed={3}
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
// props: selectedCallback()- performs selection (pops up in a modal), 
// makeChrono & makeReverseChrono - togglers for sort selector
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
            });

        // present it
        return result.then((response) => {
            return this.props.selectedCallback(response);
        });

        // IMPORTANT: catch statements intentionally left off because this api returns a
        // normal response object with error information in the case of bad input.
    }

    render() {
        return <form className="form-inline justify-content-center"
                     onSubmit={(event) => this.handleQuery(event)}>
            <input type="text"
                   value={this.state.value}
                   placeholder="YYYY-MM-DD"
                   className="form-control"
                   onChange={(event) => this.handleChange(event)}/>
            <Button color="light" onClick={(event) => this.handleQuery(event)}>Search!</Button>
            <Sorter color="light" makeChrono={this.props.makeChrono} />
        </form>;
    }
}

// props: makeChrono - function that toggle order of display
class Sorter extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
        dropdownOpen: false
      };
    }

    toggle() {
        this.setState({dropdownOpen: !this.state.dropdownOpen});
    }
  
    render() {
      return (
        <Dropdown isOpen={this.state.dropdownOpen} toggle={() => this.toggle()}>
          <DropdownToggle caret>
            Select Order
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => this.props.makeChrono(true)}>Newest to oldest</DropdownItem>
            <DropdownItem onClick={() => this.props.makeChrono(false)}>Oldest to newest</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      );
    }
  }

// props: message - error message
class BadRequestAlert extends Component {
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

      // we may want to display a false thumbnail in the case of a video
      let display = "";
      if (this.props.card.media_type === 'video') {
        display = Image;
      } else if (this.props.card.media_type === 'image') {
        display = this.props.card.url;
      }

      return (
        <div className="card" onClick={() => {
              this.props.selectedCallback(this.props.card)}}>
            <figure>
                <img src={display} alt={this.props.card.title} aria-labelledby={this.props.card.title}/>
                <figcaption>{this.props.card.title + " | " + this.props.card.date}</figcaption>
            </figure>
        </div>);
    }
}

// Props (cards): Array of json objects from NASA
class CardList extends Component {
    render() {
        let listOfCards = this.props.cards.map((card) => {
            return (
                <div className="col-md-6" key={card.date}>
                    <Card card={card} selectedCallback={this.props.selectedCallback}/>
                </div>);
        });
        return (
            <div className="container">
                <div className="row">
                    {listOfCards}
                </div>
            </div>);
    }
}

// props: date - day that these asteroids are closest to earth
class Asteroid extends Component {
    constructor(props){
        super(props);
        this.state = {count: 0};
    }

    componentDidMount() {
        let asteroidURL = 'https://api.nasa.gov/neo/rest/v1/feed?api_key=EzzKNCDQOcV3fJHd4ab0NQP551lX5ImTaqkZ037e';

        // find selection
        let promise = fetch(asteroidURL + "&start_date=" + this.props.date + "&end_date=" + this.props.date);
         promise.then((response) => {
            return response.json();
        }).then(response => {this.setState({count: response.element_count})})
            //.then(objects => )})
            .catch((err) => (alert(err.message)));
    }

    render() {
        return (
          <div aria-labelledby={"Asteroid data"}>
            <p>Fun fact: There are {this.state.count} asteroids that got closest to Earth on {this.props.date}.</p>
          </div>
        );
    }
}


// props(card: the card, callback function: to toggle the state of App to make sure it becomes undefined
//   once you close the modal)
class PopUp extends Component {

    render() {
        // If the card is undefined return nothing
        if (this.props.card === undefined || this.props.card.code) {
            return <div></div>;
        }

        // display either the image or the provided video
        let itemOfInterest = "";
        if (this.props.card.media_type === 'video') {

          itemOfInterest = <iframe width="420" height="315"
            src={this.props.card.url} title={this.props.card.title} alt={this.props.card.title} aria-labelledby={this.props.card.title}>
          </iframe>;
        } else if (this.props.card.media_type === 'image') {
          itemOfInterest = <img src={this.props.card.url} alt={this.props.card.title} aria-labelledby={this.props.card.title}/>;
        }

        // else create the modal
        return (
            <div>{
                <Modal size={"lg"} isOpen={this.props.card !== undefined} toggle={() => {
                    this.props.toggleCallback()
                }} className={"Chocho"}>
                    {/*Header*/}
                    <ModalHeader toggle={() => {
                        this.props.toggleCallback()
                    }}>{this.props.card.title + " | " + this.props.card.date}</ModalHeader>

                    {/*Body, here it goes the image and the descriptions*/}
                    <ModalBody size="lg">
                        <figure>
                            {itemOfInterest}
                            {this.props.card.copyright && <figcaption>{this.props.card.copyright}</figcaption>}
                        </figure>
                        <p>{this.props.card.explanation}</p>

                        <Asteroid date={this.props.card.date}/>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => {
                            this.props.toggleCallback()
                        }}>Close</Button>
                    </ModalFooter>
                </Modal>}
            </div>
        );
    }
}
