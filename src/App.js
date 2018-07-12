import React, {Component} from 'react';
import './index.css';
import 'whatwg-fetch';
import moment from 'moment';
import Image from './img/vp-video-editing.jpg'
import {Pagination, PaginationItem, PaginationLink} from 'reactstrap';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap';


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

const EARLIEST_DAY = '1995-06-16';

const URL = 'https://api.nasa.gov/planetary/apod?api_key=EzzKNCDQOcV3fJHd4ab0NQP551lX5ImTaqkZ037e&hd=true&date=';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {page: 0, // current page
                      selectedCard: undefined, // selected picture (selected by click or query)
                      json: [], // array of picture objects
                      date: moment(), // current date
                      }; 

    }

    componentDidMount() {
        let currentDate = moment(this.state.date);
        let dates = [];

        // create an array of dates from current date to IMAGES_PER_PAGE days ago
        for (let i = 0; i < IMAGES_PER_PAGE; i++) {
            dates.push(currentDate.year() + "-" + currentDate.month() + "-" + currentDate.date());
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

            //Test code TODO
            console.log(jsonArr);

            this.setState({json: jsonArr});
        })

    }

    cardSelection(selectedCard) {
        this.setState({selectedCard: selectedCard});
    }

    toggleCardSelection() {
        this.setState({selectedCard: undefined});
    }

    render() {
      // if the selected object is an error, get ready to display it
      let error = "";
      if (this.state.selectedCard && this.state.selectedCard.code) {
        error = <BadRequestAlert message={this.state.selectedCard.msg}/>;
      }

      return (
          <div>
              <SearchBar selectedCallback={(card) => this.cardSelection(card)} />
              {error}
              <CardList cards={this.state.json} selectedCallback={(card) => this.cardSelection(card)}/>
              <PagesSelector/>
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
                    onChange={(event) => this.handleChange(event)} />
        <Button color="light" onClick={(event) => this.handleQuery(event)}>Search!</Button>
    </form>;
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
    this.setState({ visible: false });
  }

  render() {
    return (
      <Alert color="danger" isOpen={this.state.visible} toggle={() => this.onDismiss()}>
        {this.props.message}
      </Alert>
    );
  }
}

class PagesSelector extends Component {
    render() {
        return (
            <Pagination aria-label="Page navigation">
                <PaginationItem>
                    <PaginationLink previous href="#"/>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink>
                        1
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        2
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        3
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        4
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">
                        5
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink next href="#"/>
                </PaginationItem>
            </Pagination>
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
                <img src={display} alt={this.props.card.title}/>
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
          <div class="col-md-6">
            <Card key={card.date} card={card} selectedCallback={this.props.selectedCallback}/>
          </div>);
        });
      return (
        <div class="container">
          <div class="row">
            {listOfCards}
          </div>
        </div>);
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
            src={this.props.card.url}>
          </iframe>;
        } else if (this.props.card.media_type === 'image') {
          itemOfInterest = <img src={this.props.card.url}/>;
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
