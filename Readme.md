# CLONE ( Application with features such as youtube )
clone is an backend application built with mongodb & express.js. That allows users to create channels, upload videos to their channels,can see other channel videos, like on videos, comment and tweet, create playlists, and engage with their audience. It provides a seamless platform for content creators to manage their video content and interact with subscribers.

## Getting Started

### Prerequisites
* Node.js installed
* MongoDB installed and running
* Cloudinary account

### Installation
Clone the repository:
```bash
git clone https://github.com/vivek-gupta-devs/clone.git
cd clone
```

Install dependencies:
```bash
 npm install
```

Set up the MongoDB database:
* Create a MongoDB database.
* Update the database connection string in the .env file.

Set up cloudinary:
```bash
CLOUD_NAME=<your cloud name>
API_KEY=<your api key>
API_SECRET=<your api secret>
```

Set up .env file:
```bash
PORT=3000
MONGO_URI=url
LIMIT=16kb 
ORIGIN=*
ACCESS_TOKEN_SECRET=**********
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=*********
REFRESH_TOKEN_EXPIRY=10d
```

Start the application:
* npm run dev

## Contribution
If you have suggestions or find bugs, feel free to open an issue.


