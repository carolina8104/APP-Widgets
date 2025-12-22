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


## Team Contributions
### Carolina Rodrigues (carolina8104)

| Feature | Description |
|---------|-------------|
| **Notes Widget** | Full CRUD operations (create, view, edit, delete), widget styles (dashboard & expanded modes), API endpoints |
| **Tasks Widget** | Complete task management (create, toggle complete, delete), API endpoints, integration with dashboard, XP rewards system |
| **Login/Authentication** | Login & registration forms, bcrypt password hashing, session persistence with localStorage, user account creation |
| **Profile Widget** | Profile display with avatar, user statistics, settings panel, theme selection (2 unlocked/4 locked), profile photo upload/delete, appear online toggle |
| **Progress Widget** | Interactive calendar events donut chart, tasks progression bar chart with weekly view, global statistics, friend's progress tracking |
| **Themes System** | Complete theming infrastructure, 6 theme variants, CSS variable system, theme persistence, unlock system based on level progression |
| **XP & Level System** | Level progression logic, XP rewards for notes/tasks/calendar/friendships/profile actions, XP notification system, check for daily XP limits, level-up notifications with theme/sticker unlocks |
| **Calendar (Shared Tasks)** | Participant selection for shared tasks, real-time updates via SSE, shared task deletion (user-specific), task-added/task-left notifications, profile photo integration for participants |
| **Stickers System** | Locked/unlocked stickers based on level (1 default + 1 every 3 levels), sticker unlock notifications |
| **Online Status** | Online/offline status system, real-time status updates via SSE, online indicator for friends, appear online/offline toggle, status tracking on login/logout/window close |
| **Server-Sent Events (SSE)** | SSE infrastructure implementation, broadcast events for todos, notifications, calendar, online status, real-time synchronization across frontend |
| **Backend/Database** | MongoDB connection setup, REST API structure, base HTTP server, static file serving, helper functions (sendJson, parseBody) |

### Simão Cunha (SCunha24)
| Feature | Description |
|---------|-------------|
| **Calendar Widget** | Complete calendar implementation (week view, navigation, mini calendar, event display), event creation panel, event info panel (expanded & compact), event types with color coding, overlapping events handling, grouped events for compact view, tabbed simultaneous events, stickers drag-and-drop |
| **Time Tracker Widget** | Time tracking functionality, timer controls (start/stop/restart), number display styling, expand arrow functionality, responsive sizing for expanded mode |
| **Friends Widget** | Friends list display, friend search functionality, add friends feature with verification, friend requests handling, profile pictures integration, online status display, responsive sizing adjustments |
| **Photos Widget** | Photo gallery display, photo upload functionality, fetch photos from database, upload button with spinner, profile picture integration across widgets |
| **Notifications UI** | Notification bell icon, dropdown panel, friend request accept/decline buttons, notification styling, alignment with grid layout, integration with top bar |
| **Top Bar** | Navigation bar styling, notifications integration, logout button positioning |
| **Layout & Grid System** | Responsive grid layout for all widgets, widget class structure, expand/collapse animations, scroll behavior fixes, responsiveness across screen sizes, widget positioning optimization |
| **Stickers (Calendar)** | Sticker endpoints (GET/POST/bulk operations), sticker grid UI, drag-and-drop handlers, sticker persistence per event |
| **Event Management** | Event deletion, event time/description display, event color system, drop shadow effects, participant display in events |
| **Server Configuration** | Server deployment on DEI infrastructure, port configuration, URL management for production/development |
| **General Support** | Code refactoring (promises to async/await) |


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


## Contributions by Task

| Widget/Feature | Task | Who |
|---|---|---|
| Electron App | Initialize the Electron app with a simple notes widget | Simão |
| Backend/Database | MongoDB connection and integration | Carolina |
| Backend/Database | Setup HTTP server and static file serving | Carolina |
| Dashboard Grid | Responsive grid layout for all widgets | Simão |
| Dashboard Grid | Widget expand/collapse | Simão |
| Dashboard Grid | Widget positioning optimization | Simão |
| Notes | Create a new note | Carolina |
| Notes | View an existing note | Carolina |
| Notes | Edit an existing note | Carolina |
| Notes | See all notes | Carolina |
| Notes | Widget styles on dashboard | Carolina |
| Notes | Widget styles on the 4 expanded modes | Carolina |
| Top Bar | Navigation bar styling | Simão |
| Top Bar | Notifications integration | Simão |
| Top Bar | Logout button positioning | Simão |
| Time Tracker | Time tracking functionality | Simão |
| Time Tracker | Timer controls (start/stop/restart) | Simão |
| Time Tracker | Responsive sizing for expanded mode | Simão |
| Photos | Photo gallery display | Simão |
| Photos | Photo upload functionality | Simão |
| Photos | Profile picture integration across widgets | Simão |
| Login | Login, create account and logout features | Carolina |
| Login | Bcrypt password validation for security | Carolina |
| Login | Persist user session in localStorage | Carolina |
| Login | Login styles | Carolina |
| Friends | Friends list display | Simão |
| Friends | Friend search functionality | Simão |
| Friends | Add friends feature with verification | Simão |
| Friends | Friend requests handling | Simão |
| Friends | Profile pictures integration | Simão |
| Friends | Online status display | Simão |
| Friends | Responsive sizing adjustments | Simão |
| To-do (Tasks) | Create and delete task functionalities | Carolina |
| To-do (Tasks) | Widget styles dashboard+expanded mode | Carolina |
| Progress | Global statistics | Carolina |
| Progress | Bar chart with tasks data + stats | Carolina |
| Progress | Donut chart with calendar data | Carolina |
| Progress | Friend's level and progress view | Carolina |
| Progress | Widget styles dashboard+expanded mode | Carolina |
| Profile | Appear online toggle | Carolina |
| Profile | Personal information section | Carolina |
| Profile | User statistics display | Carolina |
| Profile | Theme selection (2 unlocked/4 locked) | Carolina |
| Profile | Allow user to upload/change profile photo | Carolina |
| Notifications | Notification bell icon | Simão |
| Notifications | Dropdown panel | Simão |
| Notifications | Friend request accept/decline buttons | Simão |
| Notifications | Notification styling | Simão |
| Calendar | Complete calendar implementation (week view, navigation, mini calendar, event display) | Simão |
| Calendar | Event creation panel | Simão |
| Calendar | Event info panel (expanded & compact) | Simão |
| Calendar | Event types with color coding | Simão |
| Calendar | Overlapping events handling | Simão |
| Calendar | Grouped events for compact view | Simão |
| Calendar | Tabbed simultaneous events | Simão |
| Calendar | Stickers drag-and-drop | Simão |
| Calendar (Shared Tasks) | Associate friends in a calendar event (participant selection and display) | Carolina |
| Calendar (Shared Tasks) | Delete shared tasks only for the user (not globally) | Carolina |
| Calendar (Shared Tasks) | Notifications when added to a task or when someone leaves it | Carolina |
| Themes | Theme selection functionality | Carolina |
| Themes | Save theme as preference using localStorage | Carolina |
| Themes | Themes colors palettes | Carolina |
| XP/Level | Reward and notifications system | Carolina |
| XP/Level | Add XP related with notes, tasks, friendships, profile photo, calendar | Carolina |
| XP/Level | Level progression functionality | Carolina |
| XP/Level | Themes and stickers unlocked with level progression | Carolina |



## Project Structure
```
APP-Widgets/
├── css/                    # Stylesheets for each widget
├── server/                 # Backend server code
│   ├── db.js              # MongoDB connection
│   └── server.js          # HTTP server & API endpoints
├── src/                    # Frontend React components
│   ├── app.jsx            # Main app component
│   ├── calendar.jsx       # Calendar widget
│   ├── friends.jsx        # Friends widget
│   ├── login.jsx          # Login/registration
│   ├── notes.jsx          # Notes widget
│   ├── notifications.jsx  # Notifications dropdown
│   ├── photo.jsx          # Photo gallery
│   ├── profile.jsx        # User profile
│   ├── progress.jsx       # Progress charts
│   ├── task.jsx           # Task list
│   ├── themes.jsx         # Theme selector
│   ├── timeTracker.jsx    # Time tracker
│   ├── topBar.jsx         # Top navigation
│   └── widget.jsx         # Widget wrapper component
├── uploads/                # User uploaded files
├── index.html              # Main HTML file
├── main.js                 # Electron main process
├── preload.js              # Electron preload script
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Authors
- **Carolina Rodrigues** (carolina8104)
- **Simão Cunha** (SCunha24)