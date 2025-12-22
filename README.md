# APP-Widgets
NaNo is a productivity dashboard desktop application built with Electron, designed especially for young people who want to organize their life, boost motivation, and collaborate with friends. It features real-time widgets for task management, notes, calendar events, time tracking, and social features—all in a fun, modern, and customizable environment. NaNo helps you stay productive, unlock achievements, and connect with others while making daily organization enjoyable and rewarding.

![Dashboard](./img/tasks.png)
![Dashboard with different themes](./img/tasks.png)
![Login](./img/tasks.png)
![Calendar Widget expanded](./img/tasks.png)

## Project Description
NaNo is a comprehensive productivity platform that combines multiple essential tools into a single desktop application. The app provides users with:

- **Notes Widget**: Create, edit, view, and manage personal notes
- **Tasks Widget**: Track daily tasks with completion status and XP rewards
- **Calendar Widget**: Schedule events with time management, stickers, and shared tasks with friends
- **Time Tracker**: Monitor time spent on activities with start/stop/restart controls
- **Progress Widget**: Visualize productivity statistics with interactive charts
- **Friends System**: Connect with other users, share tasks, and see online status
- **Profile Management**: Customize themes, upload profile photos, and track achievements
- **XP & Level System**: Earn experience points and unlock themes/stickers as you progress
- **Notifications**: Real-time updates for tasks, level-ups, and share events


## Running the Application
### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (running locally or accessible via connection string)
- **npm** (comes with Node.js)


## Installation & Setup
### 1. Clone the Repository

```bash
git clone https://github.com/carolina8104/APP-Widgets.git
cd APP-Widgets
```

### 2. Install Dependencies

```bash
npm install
```

## Start MongoDB and Server Locally
### Step 1: Start MongoDB
Make sure MongoDB is installed on your system. Then start the MongoDB service:
**On Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or if using mongod directly:
mongod --dbpath data --port 27017
```

**On macOS/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or using Homebrew (macOS):
brew services start mongodb-community
```

### Step 2: Start the Backend Server
Open a terminal and run:

```bash
cd server
node server.js
```

The server will start on `http://10.17.0.27:80` by default and automatically connect to MongoDB at `mongodb://localhost:27017` with database name `productivity_app`.
To test it locally just change the const API_URL (line 4) src/app.jsx to 'http://localhost:80'.


## Running the Electron App
Once the backend server is running, open a **new terminal window** and start the Electron app:

```bash
npm start
```

The Electron desktop application will launch and automatically connect to the server running at `http://10.17.0.27:80`.

**Note:** Make sure the server is running before starting the Electron app, otherwise the application won't be able to fetch or save data.


## Contributions by Widget/Feature

| Widget/Feature      | Tasks                                                                                                                                         | Who      |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|----------|
| Electron App        | • Initialize Electron app with a simple notes widget                                                                                          | Simão    |
| Backend/Database    | • MongoDB connection and integration<br>• Setup HTTP server and static file serving                                                           | Carolina |
| Dashboard Grid      | • Responsive grid layout for all widgets<br>• Widget expand/collapse<br>• Widget positioning optimization                                     | Simão    |
| Notes               | • Create a new note<br>• View an existing note<br>• Edit an existing note<br>• See all notes<br>• Widget styles on dashboard<br>• Widget styles on the 4 expanded modes | Carolina |
| Top Bar             | • Navigation bar styling<br>• Notifications integration<br>• Logout button positioning                                                        | Simão    |
| Time Tracker        | • Time tracking functionality<br>• Timer controls (start/stop/restart)<br>• Responsive sizing for expanded mode                               | Simão    |
| Photos              | • Photo gallery display<br>• Photo upload functionality<br>• Profile picture integration across widgets                                       | Simão    |
| Login               | • Login, create account and logout features<br>• Bcrypt password validation for security<br>• Persist user session in localStorage<br>• Login styles | Carolina |
| Friends             | • Friends list display<br>• Friend search functionality<br>• Add friends feature with verification<br>• Friend requests handling<br>• Profile pictures integration<br>• Online status display<br>• Responsive sizing adjustments | Simão    |
| To-do (tasks)       | • Create and delete task functionalities<br>• Widget styles dashboard+expanded mode                                                           | Carolina |
| Progress            | • Global statistics<br>• Bar chart with tasks data + stats<br>• Donut chart with calendar data<br>• Friend's level and progress view<br>• Widget styles dashboard+expanded mode | Carolina |
| Profile             | • Appear online toggle<br>• Personal information section<br>• User statistics display<br>• Theme selection (2 unlocked/4 locked)<br>• Allow user to upload/change profile photo | Carolina |
| Notifications       | • Notification bell icon<br>• Dropdown panel<br>• Friend request accept/decline buttons<br>• Notification styling                             | Simão    |
| Calendar            | • Complete calendar implementation (week view, navigation, mini calendar, event display)<br>• Event creation panel<br>• Event info panel (expanded & compact)<br>• Event types with color coding<br>• Overlapping events handling<br>• Grouped events for compact view<br>• Tabbed simultaneous events<br>• Stickers drag-and-drop | Simão    |
| Calendar (Shared Tasks) | • Associate friends in a calendar event (participant selection and display)<br>• Delete shared tasks only for the user (not globally)<br>• Notifications when added to a task or when someone leaves it | Carolina |
| Themes              | • Theme selection functionality<br>• Save theme as preference using localStorage<br>• Themes colors palettes                                  | Carolina |
| XP/Level            | • Reward and notifications system<br>• Add XP related with notes, tasks, friendships, profile photo, calendar<br>• Level progression functionality<br>• Themes and stickers unlocked with level progression | Carolina |


## Authors
- **Carolina Rodrigues** (carolina8104)
- **Simão Cunha** (SCunha24)