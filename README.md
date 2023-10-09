# ASTRAI API

<div align="center">
    <img width=30% src="https://media.discordapp.net/attachments/1160280907471655038/1160714791426457690/logo.png?ex=6535aae3&is=652335e3&hm=033a40265abb1bdbbdf38e42a833e912f6eae9c0ee7d73fd4a5d4d6cc3ce3190&=&width=676&height=670" alt="ASTRAI Logo" />
</div>
<br>
<br>
Welcome to the ASTRAI API repository! ASTRAI (Astronomy and Space-Time Response Artificial Intelligence) is your helpful space assistant designed to assist with space-related queries.

## Description

ASTRAI is a RESTful API that allows you to interact with a space-themed AI assistant. You can send a question to the API, and it will provide you with a space-related response. The API is available at [https://apiastrai.fly.dev/api/v1/conversation](https://apiastrai.fly.dev/api/v1/conversation) and does not require authentication.

## API Usage

The ASTRAI API is available for public use, and you can access it at the following URL:

- [https://apiastrai.fly.dev/api/v1/conversation](https://apiastrai.fly.dev/api/v1/conversation)

No authentication is required to use the API. Feel free to send your space-related queries and receive informative responses from ASTRAI.

## How to Set Up Locally

To run the ASTRAI API locally, follow these steps:

### Prerequisites

- Node.js: Make sure you have Node.js installed on your computer. You can download it from [https://nodejs.org/](https://nodejs.org/).

### Installation

1. Clone this repository to your local machine:

 ```bash
git clone https://github.com/yourusername/astai-api.git
```

2. Navigate to the project directory:

```bash
cd astai-api
```

3. Install the project dependencies:
```bash
npm install
```

### Usage
After successfully setting up the project, you can start the API server locally:

```bash
npm start
```

The API will be available at http://localhost:3000/api/v1/conversation.

## How to Use the API
You can interact with the ASTRAI API by sending a POST request to the endpoint http://localhost:3000/api/v1/conversation with the following JSON body:

```json
{
    "input": "Your question here"
}
```

The API will respond with space-related information based on your question. Here's an example response:

```json
[
    {
        "informationSource": "general",
        "question": "Your question here",
        "response": "Response from ASTRAI."
    }
]
```

Feel free to ask ASTRAI any space-related questions, and it will provide you with informative answers!
