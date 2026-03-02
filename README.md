# Bar's Popko Dashboard

A modern task and work hours management dashboard that evolved from Excel spreadsheets to a full-featured React web application.

## 🎯 Project Overview

This project started as a series of Excel spreadsheets for tracking work hours, tasks, missions, and vacation days. It has been transformed into a sleek, modern web application that provides:

- **Task Management** - Track todos with priorities, categories, progress, and due dates
- **Work Hours Tracking** - Monitor daily work hours, breaks, vacation days, and sick days
- **Calendar View** - Visual representation of work days, weekends, vacations, and more
- **Real-time Timers** - Track entry and exit times with automatic calculations
- **Statistics** - View comprehensive stats about your work patterns and task completion
- **Data Management** - Import from Excel and export data back to Excel format

### The Evolution

**Before (Excel):**
- Manual tracking of work hours in spreadsheet cells
- Complex formulas for calculating overtime and missing hours
- Separate sheets for tasks, missions, and time tracking
- Hebrew language support for local requirements
![TIME](https://i.imgur.com/qjNMve1.png "Optional title text")
![TASKS](https://i.imgur.com/r8jItt2.png "Optional title text")


**After (Web Application):**

- Clean, intuitive user interface with dark/light theme support
- Automatic time calculations and statistics
- Interactive calendar with color-coded day types
- Real-time work session tracking
- Integrated task and work hours management in one place
- 
![TASKS](https://i.imgur.com/8ZMTZnh.png "Optional title text")
![TIME](https://i.imgur.com/6ZEWDKA.png "Optional title text")


## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd todo-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   The application will be running at `http://localhost:5173` (or another port shown in the terminal)

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 📋 Features

### Task Dashboard

- **Add Tasks** - Create new tasks with title, description, priority, and due dates
- **Task Status** - Mark tasks as pending, in progress, or completed
- **Categories** - Organize tasks by category (work, firmware, etc.)
- **Priority Levels** - Set priorities (low, medium, high)
- **Progress Tracking** - Visual progress bars for each task
- **Filtering** - Filter tasks by status, priority, and category
- **Search** - Quickly find tasks by name
- **Bulk Actions** - Select and manage multiple tasks at once

### Work Hours Dashboard

- **Daily Tracking** - Track entry time, exit time, and breaks
- **Work Types** - Set day type (regular work day, vacation, sick day, weekend, etc.)
- **Automatic Calculations** 
  - Total work hours per day
  - Missing hours from expected work day
  - Overtime accumulation
  - Vacation and sick days balance
- **Real-time Timer** - Start/stop timer for current work session
- **Calendar View** - Visual monthly calendar with color-coded day types
  - Green: Regular work day
  - Red: Late/Short work day
  - Blue: Vacation
  - Orange: Note/Special day
  - Purple: Work from home (WFH)
- **Statistics Cards**
  - Today's status
  - Work day length
  - Vacation days remaining
  - Sick days count

### Data Management

- **Import Excel** - Import your existing Excel work hour data
- **Export to Excel** - Export your data back to Excel format for backup or sharing
- **Local Storage** - All data is stored in your browser's localStorage (no database required)

## 🎨 User Interface

### Theme Support
- **Light Mode** - Clean, bright interface for daytime use
- **Dark Mode** - Easy on the eyes for nighttime work

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Adaptive layouts for different screen sizes

### Hebrew Language Support
- Full RTL (right-to-left) support
- Hebrew text throughout the interface
- Maintains compatibility with the original Excel workflow

## 🛠️ Technology Stack

- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **xlsx** - Excel file import/export
- **React Router** - Navigation between views

## 📁 Project Structure

```
todo-dashboard/
├── src/
│   ├── components/        # React components
│   │   ├── TodoApp.tsx           # Task management
│   │   ├── WorkDashboard.tsx     # Work hours tracking
│   │   ├── WorkCalendar.tsx      # Calendar view
│   │   ├── DashboardStats.tsx    # Statistics cards
│   │   └── ...                   # Other components
│   ├── hooks/             # Custom React hooks
│   │   ├── useTodos.ts           # Task management logic
│   │   ├── useWorkHours.ts       # Work hours logic
│   │   └── useLocalStorage.ts    # Browser storage
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── contexts/          # React contexts
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## 💾 Data Storage

This application uses **browser localStorage** for data persistence:
- No backend server or database required
- All data stays on your local machine
- Data persists between browser sessions
- Clear browser data will delete all stored information
- Data is not synced across devices or browsers

**Note:** For production use with multiple users or device sync, consider adding a backend with a database (MongoDB, PostgreSQL, etc.).

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 📝 Usage Tips

1. **Starting Your Day:**
   - Switch to Work Hours tab
   - Click "Start Day" or manually enter your entry time
   - The timer will track your work session

2. **Ending Your Day:**
   - Click "End Work" button
   - The app automatically calculates total hours and breaks

3. **Managing Tasks:**
   - Add tasks with clear descriptions and due dates
   - Update priority and progress as you work
   - Mark tasks complete when finished

4. **Backing Up Data:**
   - Use "Export to Excel" button regularly
   - Keep Excel backups for data safety

5. **Importing Old Data:**
   - Use "Import Excel" to bring in data from your old Excel sheets
   - Supported format matches the original Excel structure

## 🌟 Future Enhancements

Potential features to consider:
- Backend database integration
- Multi-user support
- Data sync across devices
- Advanced reporting and analytics
- Mobile app version
- Integration with calendar applications
- Notifications for task deadlines

## 📄 License

This is a personal project. Feel free to use and modify for your own needs.

## 👤 Author

Bar Popko

---

**From Excel to Web - Making work tracking easier and more efficient!**
