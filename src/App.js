import React, {Component} from 'react';
import './index.css';
import 'whatwg-fetch';
import moment from 'moment';
import Image from './img/vp-video-editing.jpg'
import {Pagination, PaginationItem, PaginationLink} from 'reactstrap';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


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

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {page: 0, json: [], date: moment(), value: ""}
    }


    componentDidMount() {
        let currentDate = moment(this.state.date);
        let arr = [];
        for (let i = 0; i < 8; i++) {

            arr.push(currentDate.year() + "-" + currentDate.month() + "-" + currentDate.date());
            currentDate.subtract(1, 'days');
        }
        console.log(arr);

        let error = fetch('https://api.nasa.gov/planetary/apod?api_key=EzzKNCDQOcV3fJHd4ab0NQP551lX5ImTaqkZ037e&date=1990-09-09').then((response) => response.json()).then((data) => {
            console.log(data)
        }).catch((err) => {
            alert(err.message)
        });


        Promise.all(arr.map((date) => {
            return fetch('https://api.nasa.gov/planetary/apod?api_key=EzzKNCDQOcV3fJHd4ab0NQP551lX5ImTaqkZ037e&date=' + date)
                .then((response) => {
                    return response.json()
                }).catch((err) => {
                    alert(err.message)
                })
        })).then((jsonArr) => {
            console.log(jsonArr);
            this.setState({json: jsonArr});
        })

    }

    render() {
        console.log(this.state.page);
        return (
            <div>
                <SearchBar value={this.state.value}/>
                <CardList cards={this.state.json}/>
                <PagesSelector/>
            </div>
        );
    }
}

export default App;

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

// Props(card): json file from NASA
class Card extends Component {
    render() {

        return (<div className="card">
            <figure>{this.props.card.media_type === 'video' ?
                <a target="_blank" href={this.props.card.url}><img src={Image} alt={this.props.card.title}/> </a> :
                <img src={this.props.card.url} alt={this.props.card.title}/>}
                <figcaption>{this.props.card.title}</figcaption>
            </figure>
        </div>);
    }
}

// Props (cards): Array of json file from NASA
class CardList extends Component {
    render() {
        let listOfCards = this.props.cards.map((card) => {
                return <Card key={card.date} card={card}/>
            }
        );
        return (<section className="spread">{listOfCards}</section>)
    }
}

class PopUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }

    render() {
        return (
            <div>
                <Button color="danger" onClick={this.toggle}>{this.props.buttonLabel}</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
                    <ModalBody>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggle}>Do Something</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

class SearchBar extends Component {
    render() {
        return <form className="form-inline" method="GET" action="https://itunes.apple.com/search">
            <div className="form-group mr-3">
                <label htmlFor="searchQuery" className="mr-2">What do you want to hear?</label>
                TODO
                <input type="text" value={this.props.value} className="form-control" onChange={() => (console.log())}/>
            </div>
            <Button color="primary">Search!</Button>
        </form>;
    }
}