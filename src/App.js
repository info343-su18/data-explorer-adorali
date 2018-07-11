import React, {Component} from 'react';
import './index.css';
import 'whatwg-fetch';
import moment from 'moment';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {page: 0, json: [], date: moment(),}
    }


    componentDidMount() {
        let currentDate = moment(this.state.date);
        let arr = [];
        for (let i = 0; i < 20; i++) {

            arr.push(currentDate.year() + "-" + currentDate.month() + "-" + currentDate.date());
            currentDate.subtract(1, 'days');
        }
        console.log(arr);

        let error = fetch('https://api.nasa.gov/planetary/apod?api_key=EzzKNCDQOcV3fJHd4ab0NQP551lX5ImTaqkZ037e&date=1990-09-09').
        then((response) => response.json()).then((data)=>{console.log(data)}).catch((err) =>{alert(err.message)});


        Promise.all(arr.map((date) => {
             return fetch('https://api.nasa.gov/planetary/apod?api_key=EzzKNCDQOcV3fJHd4ab0NQP551lX5ImTaqkZ037e&date=' + date)
                .then((response) => {
                    return response.json()
                }).catch((err) => {alert(err.message)})
        })).then((jsonArr) =>{
            console.log(jsonArr);
            this.setState({json:jsonArr});
        })

    }

    render() {
        console.log(this.state.page);
        return (
            <button onClick={() => {this.setState({page:this.state.page + 1})}}>Hello</button>
        );
    }
}

export default App;

class Paginator extends Component{

}

class Card extends Component{
    render(){
        return(<div className="card">
            <figure>
                <img src="./road.jpg" alt="cloud"/>
                <figcaption>Cloud</figcaption>
            </figure>
        </div>);
    }
}

class CardList extends Component{

}

class PopUp extends Component{

}