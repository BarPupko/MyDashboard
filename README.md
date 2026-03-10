# Bar's Dashboard

A personal task and work hours management web app — built to replace a set of Excel spreadsheets I used daily for tracking work hours, tasks, and vacation days.

## What it does

### Task Management
Create and track tasks with priorities, categories, progress percentages, and due dates. Filter and search across tasks, update their status as work progresses, and bulk-manage multiple items at once.

### Work Hours Tracking
Log daily entry/exit times, breaks, and day types (regular, vacation, sick, WFH, etc.). The app automatically calculates total hours worked, overtime, and missing hours against an expected workday. A real-time timer tracks active work sessions.

### Calendar View
A monthly calendar that color-codes each day by type — green for regular days, red for short/late days, blue for vacation, purple for WFH, and orange for special notes.

### Data & Backup
Import existing data from Excel files and export everything back to Excel for backup. All data is stored in the browser's localStorage — no account, no server, no sync.

## The backstory

This started as Excel sheets with manual formulas for calculating overtime and tracking tasks across separate tabs. The web app replaces all of that with a cleaner interface, automatic calculations, and everything in one place. Hebrew language and RTL layout are supported throughout, matching the original workflow.

**Before:**

![Excel Time Tracking](https://i.imgur.com/qjNMve1.png)
![Excel Tasks](https://i.imgur.com/r8jItt2.png)

**After:**

![Dashboard Tasks](https://i.imgur.com/8ZMTZnh.png)
![Dashboard Time](https://i.imgur.com/6ZEWDKA.png)

## Stack

React 19, TypeScript, Vite, Tailwind CSS, Radix UI, React Router, xlsx

## Author

Bar Popko — [barpupko.github.io/MyDashboard](https://barpupko.github.io/MyDashboard)
