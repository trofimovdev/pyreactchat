import React, { Component } from "react";
import ReactTooltip from 'react-tooltip';
import { animateScroll } from "react-scroll";
import '../styles/App.css';



class ChatHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {latency: 0,
									quality: 'good'};
		this.timer = this.timer.bind(this);
    this.timer();
		this.timer();
		this.timer();
    setInterval(this.timer, 5000);
	}

  timer() {
    const start = new Date().getTime();
    fetch('https://pyreactchat.herokuapp.com/api/online/')
			.then((response) => response.json())
      .then(
        (response) => {
          const end = new Date().getTime();
          const latency = end - start;
					let quality = 'good';
          if (latency < 70) {
            quality = 'good';
          } else if (latency < 250) {
            quality = 'standart';
          } else {
            quality = 'bad';
          }
					this.setState({latency: latency,
												 online: parseInt(response),
											 	 quality: quality});
        }
      )
			.catch(
				(error) => {
					console.log(error);
					this.setState({latency: -1,
												 quality: 'bad'});
				}
			);
  }

  render() {
    return (
      <header className="header">
        <div className="logo">
          <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?w=60" alt="logo" />
        </div>
        <div className="info">
          <h1 className="chatname">{this.props.chatname} <span className={`ping ${this.state.quality}`} data-tip><ReactTooltip getContent={() => (`Задержка: ${this.state.latency}мс`)} /></span></h1>
          <p className="users">Онлайн: {this.state.online}</p>
        </div>
      </header>
    );
  }
}


class ChatBox extends Component {
	constructor(props) {
		super(props);
		this.state = {chat: []};
		this.ready = false;
		fetch('https://pyreactchat.herokuapp.com/api/ip/')
			.then((response) => response.text())
      .then((response) => {
				this.ip = response;
			});
		this.ws = this.props.ws;
		this.ws.onmessage = (response) => {
			const data = JSON.parse(response.data);
			if (data['action'] == 'messages') {
				this.setState({
					chat: data['data']});
			}
		};
	}

  render() {
		const chat = [];
		for (const [ip, message, key] of this.state.chat) {
			if (ip == this.ip) {
				chat.push(<div className="msg from-me" key={key}>{message}</div>);
			} else {
				chat.push(<div className="msg from-them" key={key}>{message}</div>);
			}
		};
    return (
      <section className="chatbox" id="chat">
				{chat}
      </section>
    );
  }

	scrollToBottom(props) {
		animateScroll.scrollToBottom(props);
	}

	componentDidUpdate() {
		if (this.ready) {
		  this.scrollToBottom({
	      containerId: "chat",
				smooth: true,
				duration: 150
	    });
		} else {
			this.scrollToBottom({
	      containerId: "chat",
				smooth: false,
				duration: 0
	    });
			this.ready = true;
		}
	}
}


class SendMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {message: '',
									counter: this.props.counter,
									connected: false};
    this.send = this.send.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.ws = this.props.ws;
		this.ws.onopen = () => {
      this.setState({connected: true});
			const data = {action: 'get_messages'};
			this.ws.send(JSON.stringify(data));
		};
  }

  send() {
		if (this.state.connected) {
			const data = {action: 'send_message',
										data: this.state.message};
			this.ws.send(JSON.stringify(data));
			this.setState({message: '',
										 counter: this.props.counter});
		}
  }

	handleChange(event) {
		this.setState({message: event.target.value,
									 counter: this.props.counter - event.target.value.length});
	}

	handleKeyDown(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
      {this.send()};
    }
	}

  render() {
    return (
      <footer className="sendmessage">
        <textarea placeholder="Сообщение" onChange={this.handleChange} onKeyDown={this.handleKeyDown} maxLength={this.props.counter} value={this.state.message}></textarea>
        <div className="send">
          <svg onClick={this.send} width="25" height="25" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1764 11q33 24 27 64l-256 1536q-5 29-32 45-14 8-31 8-11 0-24-5l-453-185-242 295q-18 23-49 23-13 0-22-4-19-7-30.5-23.5t-11.5-36.5v-349l864-1059-1069 925-395-162q-37-14-40-55-2-40 32-59l1664-960q15-9 32-9 20 0 36 11z"/></svg>
          <p className="counter">{this.state.counter}</p>
        </div>
      </footer>
    );
  }
}


class Chat extends Component {
  constructor(props) {
    super(props);
		this.ws = new WebSocket('wss://pyreactchat.herokuapp.com/ws/');
	}

  render() {
    return (
			<main className="chat">
		    <ChatHeader chatname="Реактивный чат" />
		    <ChatBox ws={this.ws} />
		    <SendMessage counter="140" ws={this.ws} />
		  </main>
    );
  }

}


class App extends Component {
  render() {
    return (
      <Chat />
    );
  }
}


export default App;
